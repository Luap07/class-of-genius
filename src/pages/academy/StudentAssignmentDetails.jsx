import React, {
  useCallback,
  useEffect,
  useMemo,
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
   BASIC HELPERS
============================================================ */

const cleanValue = (value) => {
  if (
    value === undefined ||
    value === null
  ) {
    return "";
  }

  if (
    typeof value === "object"
  ) {
    return "";
  }

  return String(value).trim();
};

const firstNonEmpty = (...values) => {
  for (const value of values) {
    if (
      value !== undefined &&
      value !== null
    ) {
      const cleaned =
        cleanValue(value);

      if (cleaned) {
        return cleaned;
      }
    }
  }

  return "";
};

const isUsableIdentity = (value) => {
  const cleaned =
    cleanValue(value);

  if (!cleaned) {
    return false;
  }

  const lowered =
    cleaned.toLowerCase();

  if (
    lowered === "undefined" ||
    lowered === "null" ||
    lowered === "unknown" ||
    lowered === "student" ||
    lowered === "[object object]"
  ) {
    return false;
  }

  return true;
};

const safelyParseJSON = (value) => {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const readLocalStorageObject = (key) => {
  try {
    const raw =
      localStorage.getItem(key);

    if (!raw) {
      return null;
    }

    return safelyParseJSON(raw);
  } catch {
    return null;
  }
};

const readLocalStorageValue = (keys) => {
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
      // Ignore.
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
  if (
    value === undefined ||
    value === null
  ) {
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
    const trimmed =
      value.trim();

    if (!trimmed) {
      return null;
    }

    try {
      return JSON.parse(trimmed);
    } catch {
      return null;
    }
  }

  return null;
};

const deriveFileNameFromUrl = (
  url
) => {
  const value =
    cleanValue(url);

  if (!value) {
    return "";
  }

  try {
    const cleanUrl =
      value
        .split("?")[0]
        .split("#")[0];

    const parts =
      cleanUrl
        .split("/")
        .filter(Boolean);

    if (!parts.length) {
      return "";
    }

    return decodeURIComponent(
      parts[parts.length - 1]
    );
  } catch {
    return "";
  }
};

const normalizeFileCandidate = (
  candidate
) => {
  if (
    candidate === undefined ||
    candidate === null
  ) {
    return null;
  }

  if (
    typeof candidate === "string"
  ) {
    const parsed =
      parsePossibleObject(
        candidate
      );

    if (
      parsed &&
      typeof parsed === "object"
    ) {
      return normalizeFileCandidate(
        parsed
      );
    }

    const url =
      candidate.trim();

    if (!url) {
      return null;
    }

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
    return null;
  }

  const nestedCandidates = [
    candidate.file,
    candidate.document,
    candidate.attachment,
    candidate.upload,
    candidate.uploadedFile,
    candidate.uploaded_file,
    candidate.assignmentFile,
    candidate.assignment_file,
    candidate.fileData,
    candidate.file_data,
    candidate.documentFile,
    candidate.document_file,
    candidate.attachmentFile,
    candidate.attachment_file,
  ];

  let nestedFile = null;

  for (
    const nestedCandidate of nestedCandidates
  ) {
    if (
      nestedCandidate === undefined ||
      nestedCandidate === null
    ) {
      continue;
    }

    const normalized =
      normalizeFileCandidate(
        nestedCandidate
      );

    if (
      normalized?.url ||
      normalized?.name
    ) {
      nestedFile =
        normalized;

      break;
    }
  }

  const url =
    firstNonEmpty(
      candidate.url,
      candidate.fileUrl,
      candidate.file_url,
      candidate.attachmentUrl,
      candidate.attachment_url,
      candidate.documentUrl,
      candidate.document_url,
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
      candidate.path,
      nestedFile?.url
    );

  const name =
    firstNonEmpty(
      candidate.name,
      candidate.fileName,
      candidate.file_name,
      candidate.attachmentName,
      candidate.attachment_name,
      candidate.documentName,
      candidate.document_name,
      candidate.originalName,
      candidate.original_name,
      candidate.originalFilename,
      candidate.original_filename,
      candidate.filename,
      candidate.storedFilename,
      candidate.stored_filename,
      nestedFile?.name
    ) ||
    deriveFileNameFromUrl(url);

  const type =
    firstNonEmpty(
      candidate.mimeType,
      candidate.mime_type,
      candidate.fileType,
      candidate.file_type,
      candidate.contentType,
      candidate.content_type,
      candidate.attachmentType,
      candidate.attachment_type,
      candidate.documentType,
      candidate.document_type,
      candidate.type,
      nestedFile?.type
    );

  const size =
    candidate.size ??
    candidate.fileSize ??
    candidate.file_size ??
    candidate.attachmentSize ??
    candidate.attachment_size ??
    candidate.documentSize ??
    candidate.document_size ??
    candidate.bytes ??
    nestedFile?.size ??
    null;

  if (
    !url &&
    !name &&
    !type
  ) {
    return null;
  }

  return {
    url,
    name,
    type,
    size,
  };
};

const getAssignmentFile = (
  assignment
) => {
  const emptyFile = {
    url: "",
    name: "",
    type: "",
    size: null,
  };

  if (
    assignment === undefined ||
    assignment === null
  ) {
    return emptyFile;
  }

  if (
    typeof assignment === "string"
  ) {
    return (
      normalizeFileCandidate(
        assignment
      ) ||
      emptyFile
    );
  }

  if (
    typeof assignment !== "object"
  ) {
    return emptyFile;
  }

  const directCandidates = [
    assignment.file,
    assignment.document,
    assignment.attachment,
    assignment.upload,
    assignment.uploadedFile,
    assignment.uploaded_file,
    assignment.assignmentFile,
    assignment.assignment_file,
    assignment.fileData,
    assignment.file_data,
    assignment.documentFile,
    assignment.document_file,
    assignment.attachmentFile,
    assignment.attachment_file,
  ];

  for (
    const candidate of directCandidates
  ) {
    const normalized =
      normalizeFileCandidate(
        candidate
      );

    if (
      normalized?.url
    ) {
      return normalized;
    }
  }

  const arrayFields = [
    "attachments",
    "files",
    "documents",
    "uploads",
    "uploadedFiles",
    "uploaded_files",
  ];

  for (
    const field of arrayFields
  ) {
    const candidates =
      assignment[field];

    if (
      Array.isArray(candidates)
    ) {
      for (
        const candidate of candidates
      ) {
        const normalized =
          normalizeFileCandidate(
            candidate
          );

        if (
          normalized?.url
        ) {
          return normalized;
        }
      }
    } else if (
      candidates
    ) {
      const normalized =
        normalizeFileCandidate(
          candidates
        );

      if (
        normalized?.url
      ) {
        return normalized;
      }
    }
  }

  const directUrlCandidate = {
    url: firstNonEmpty(
      assignment.fileUrl,
      assignment.file_url,
      assignment.documentUrl,
      assignment.document_url,
      assignment.attachmentUrl,
      assignment.attachment_url,
      assignment.uploadUrl,
      assignment.upload_url,
      assignment.publicUrl,
      assignment.public_url,
      assignment.downloadUrl,
      assignment.download_url,
      assignment.href,
      assignment.src,
      assignment.filePath,
      assignment.file_path,
      assignment.documentPath,
      assignment.document_path,
      assignment.storagePath,
      assignment.storage_path,
      assignment.path
    ),

    name: firstNonEmpty(
      assignment.fileName,
      assignment.file_name,
      assignment.documentName,
      assignment.document_name,
      assignment.attachmentName,
      assignment.attachment_name,
      assignment.originalName,
      assignment.original_name,
      assignment.originalFilename,
      assignment.original_filename,
      assignment.filename
    ),

    type: firstNonEmpty(
      assignment.fileType,
      assignment.file_type,
      assignment.documentType,
      assignment.document_type,
      assignment.attachmentType,
      assignment.attachment_type,
      assignment.mimeType,
      assignment.mime_type,
      assignment.contentType,
      assignment.content_type
    ),

    size:
      assignment.fileSize ??
      assignment.file_size ??
      assignment.documentSize ??
      assignment.document_size ??
      assignment.attachmentSize ??
      assignment.attachment_size ??
      null,
  };

  const directNormalized =
    normalizeFileCandidate(
      directUrlCandidate
    );

  if (
    directNormalized?.url
  ) {
    return directNormalized;
  }

  const nestedContainers = [
    assignment.data,
    assignment.result,
    assignment.assignment,
    assignment.activity,
    assignment.task,
  ];

  for (
    const nested of nestedContainers
  ) {
    if (
      !nested ||
      nested === assignment
    ) {
      continue;
    }

    const normalized =
      getAssignmentFile(
        nested
      );

    if (
      normalized?.url
    ) {
      return normalized;
    }
  }

  return emptyFile;
};

/* ============================================================
   RESOLVE FILE URL
============================================================ */

const resolveFileUrl = (
  fileUrl
) => {
  if (!fileUrl) {
    return "";
  }

  let value =
    String(fileUrl).trim();

  if (!value) {
    return "";
  }

  if (
    value.startsWith("blob:") ||
    value.startsWith("data:")
  ) {
    return value;
  }

  if (
    value.startsWith("http://") ||
    value.startsWith("https://")
  ) {
    return value;
  }

  if (
    value.startsWith("//")
  ) {
    return `http:${value}`;
  }

  value =
    value.replace(
      /\\/g,
      "/"
    );

  if (
    value.startsWith("/")
  ) {
    return `${API_URL}${value}`;
  }

  return `${API_URL}/${value.replace(
    /^\/+/,
    ""
  )}`;
};

/* ============================================================
   FILE EXTENSION
============================================================ */

const getFileExtension = (
  fileName = "",
  fileType = "",
  fileUrl = ""
) => {
  const name =
    String(fileName)
      .toLowerCase()
      .trim();

  if (
    name.includes(".")
  ) {
    return name
      .split(".")
      .pop()
      .split("?")[0]
      .split("#")[0];
  }

  const url =
    String(fileUrl)
      .toLowerCase()
      .trim();

  if (
    url.includes(".")
  ) {
    const cleanUrl =
      url
        .split("?")[0]
        .split("#")[0];

    const lastPart =
      cleanUrl
        .split("/")
        .pop();

    if (
      lastPart?.includes(".")
    ) {
      return lastPart
        .split(".")
        .pop();
    }
  }

  const type =
    String(fileType)
      .toLowerCase()
      .trim();

  if (
    type.includes("pdf")
  ) {
    return "pdf";
  }

  if (
    type.includes("msword")
  ) {
    return "doc";
  }

  if (
    type.includes(
      "wordprocessingml"
    )
  ) {
    return "docx";
  }

  if (
    type.includes("mp4")
  ) {
    return "mp4";
  }

  if (
    type.includes("webm")
  ) {
    return "webm";
  }

  if (
    type.includes("quicktime")
  ) {
    return "mov";
  }

  return "";
};

const isPdfFile = (
  fileName,
  fileType,
  fileUrl
) => {
  const extension =
    getFileExtension(
      fileName,
      fileType,
      fileUrl
    );

  return (
    extension === "pdf" ||
    String(fileType)
      .toLowerCase()
      .includes("pdf")
  );
};

const isVideoFile = (
  fileName,
  fileType,
  fileUrl
) => {
  const extension =
    getFileExtension(
      fileName,
      fileType,
      fileUrl
    );

  return (
    [
      "mp4",
      "webm",
      "mov",
    ].includes(extension) ||
    String(fileType)
      .toLowerCase()
      .startsWith("video/")
  );
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

  const numeric =
    Number(size);

  if (
    !Number.isFinite(numeric) ||
    numeric <= 0
  ) {
    return "";
  }

  if (
    numeric < 1024
  ) {
    return `${numeric} B`;
  }

  if (
    numeric < 1024 * 1024
  ) {
    return `${(
      numeric / 1024
    ).toFixed(1)} KB`;
  }

  if (
    numeric <
    1024 *
      1024 *
      1024
  ) {
    return `${(
      numeric /
      (1024 * 1024)
    ).toFixed(1)} MB`;
  }

  return `${(
    numeric /
    (1024 *
      1024 *
      1024)
  ).toFixed(1)} GB`;
};

/* ============================================================
   STUDENT IDENTITY
============================================================ */

const getStudentIdentity = () => {
  const objects = [];

  for (
    const key of STUDENT_OBJECT_KEYS
  ) {
    const object =
      readLocalStorageObject(key);

    if (
      object &&
      typeof object === "object"
    ) {
      objects.push(object);
    }
  }

  const referenceObjectKeys = [
    "reference",
    "studentReference",
    "student_reference",
    "studentRef",
    "student_ref",
    "studentNumber",
    "student_number",
    "studentCode",
    "student_code",
    "enrollmentReference",
    "enrollment_reference",
  ];

  let studentReference = "";

  for (
    const student of objects
  ) {
    studentReference =
      findIdentityInObject(
        student,
        referenceObjectKeys
      );

    if (
      studentReference
    ) {
      break;
    }

    const nestedCandidates = [
      student.student,
      student.user,
      student.profile,
      student.data,
      student.account,
      student.studentData,
      student.student_data,
    ];

    for (
      const nested of nestedCandidates
    ) {
      studentReference =
        findIdentityInObject(
          nested,
          referenceObjectKeys
        );

      if (
        studentReference
      ) {
        break;
      }
    }

    if (
      studentReference
    ) {
      break;
    }
  }

  if (
    !studentReference
  ) {
    studentReference =
      readLocalStorageValue(
        STUDENT_REFERENCE_KEYS
      );
  }

  let studentId = "";

  for (
    const student of objects
  ) {
    studentId =
      findIdentityInObject(
        student,
        STUDENT_ID_KEYS
      );

    if (studentId) {
      break;
    }

    const nestedCandidates = [
      student.student,
      student.user,
      student.profile,
      student.data,
      student.account,
    ];

    for (
      const nested of nestedCandidates
    ) {
      studentId =
        findIdentityInObject(
          nested,
          STUDENT_ID_KEYS
        );

      if (studentId) {
        break;
      }
    }

    if (studentId) {
      break;
    }
  }

  if (!studentId) {
    studentId =
      readLocalStorageValue(
        STUDENT_ID_KEYS
      );
  }

  let enrollmentId = "";

  const enrollmentKeys = [
    "enrollmentId",
    "enrollment_id",
    "enrollmentID",
  ];

  for (
    const student of objects
  ) {
    enrollmentId =
      findIdentityInObject(
        student,
        enrollmentKeys
      );

    if (enrollmentId) {
      break;
    }

    const nestedCandidates = [
      student.student,
      student.user,
      student.profile,
      student.data,
      student.account,
      student.studentData,
      student.student_data,
    ];

    for (
      const nested of nestedCandidates
    ) {
      enrollmentId =
        findIdentityInObject(
          nested,
          enrollmentKeys
        );

      if (enrollmentId) {
        break;
      }
    }

    if (enrollmentId) {
      break;
    }
  }

  if (!enrollmentId) {
    for (
      const student of objects
    ) {
      const enrollmentObjects = [
        student.enrollment,
        student.enrollmentData,
        student.enrollment_data,
      ];

      for (
        const enrollment of enrollmentObjects
      ) {
        if (
          enrollment &&
          typeof enrollment === "object"
        ) {
          enrollmentId =
            findIdentityInObject(
              enrollment,
              [
                "id",
                "enrollmentId",
                "enrollment_id",
              ]
            );

          if (enrollmentId) {
            break;
          }
        }
      }

      if (enrollmentId) {
        break;
      }
    }
  }

  if (!enrollmentId) {
    for (
      const student of objects
    ) {
      const nestedObjects = [
        student.data,
        student.student,
        student.user,
        student.profile,
      ];

      for (
        const nested of nestedObjects
      ) {
        if (
          nested &&
          typeof nested === "object"
        ) {
          const enrollment =
            nested.enrollment ||
            nested.enrollmentData ||
            nested.enrollment_data;

          if (
            enrollment &&
            typeof enrollment === "object"
          ) {
            enrollmentId =
              findIdentityInObject(
                enrollment,
                [
                  "id",
                  "enrollmentId",
                  "enrollment_id",
                ]
              );

            if (enrollmentId) {
              break;
            }
          }
        }
      }

      if (enrollmentId) {
        break;
      }
    }
  }

  if (!enrollmentId) {
    try {
      const rawEnrollment =
        localStorage.getItem(
          "enrollment"
        );

      const parsed =
        safelyParseJSON(
          rawEnrollment
        );

      if (
        parsed &&
        typeof parsed === "object"
      ) {
        enrollmentId =
          findIdentityInObject(
            parsed,
            [
              "id",
              "enrollmentId",
              "enrollment_id",
            ]
          );
      }
    } catch {
      // Ignore.
    }
  }

  if (!enrollmentId) {
    enrollmentId =
      readLocalStorageValue(
        ENROLLMENT_KEYS.filter(
          (key) =>
            key !== "enrollment"
        )
      );
  }

  let studentName = "";

  const nameKeys = [
    "name",
    "fullName",
    "full_name",
    "studentName",
    "student_name",
    "displayName",
    "display_name",
  ];

  for (
    const student of objects
  ) {
    studentName =
      findIdentityInObject(
        student,
        nameKeys
      );

    if (studentName) {
      break;
    }

    const firstName =
      cleanValue(
        student.firstName ||
        student.first_name ||
        student.givenName ||
        student.given_name
      );

    const lastName =
      cleanValue(
        student.lastName ||
        student.last_name ||
        student.surname ||
        student.familyName ||
        student.family_name
      );

    if (
      firstName ||
      lastName
    ) {
      studentName =
        `${firstName} ${lastName}`.trim();

      break;
    }

    const nestedCandidates = [
      student.student,
      student.user,
      student.profile,
      student.data,
    ];

    for (
      const nested of nestedCandidates
    ) {
      studentName =
        findIdentityInObject(
          nested,
          nameKeys
        );

      if (studentName) {
        break;
      }

      const nestedFirstName =
        cleanValue(
          nested?.firstName ||
          nested?.first_name ||
          nested?.givenName ||
          nested?.given_name
        );

      const nestedLastName =
        cleanValue(
          nested?.lastName ||
          nested?.last_name ||
          nested?.surname ||
          nested?.familyName ||
          nested?.family_name
        );

      if (
        nestedFirstName ||
        nestedLastName
      ) {
        studentName =
          `${nestedFirstName} ${nestedLastName}`.trim();

        break;
      }
    }

    if (studentName) {
      break;
    }
  }

  return {
    studentReference:
      cleanValue(
        studentReference
      ),

    studentId:
      cleanValue(studentId),

    enrollmentId:
      cleanValue(enrollmentId),

    studentName:
      cleanValue(studentName),
  };
};

/* ============================================================
   TOKEN
============================================================ */

const getAcademyToken = () => {
  for (
    const key of ACADEMY_TOKEN_KEYS
  ) {
    try {
      const token =
        localStorage.getItem(key);

      if (
        isUsableIdentity(token)
      ) {
        return token.trim();
      }
    } catch {
      // Ignore.
    }
  }

  return "";
};

/* ============================================================
   AUTH HEADERS
============================================================ */

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

const getJsonAuthHeaders = () => {
  return {
    ...getAuthHeaders(),

    "Content-Type":
      "application/json",
  };
};

/* ============================================================
   NORMALIZE QUESTION
============================================================ */

const normalizeQuestion = (
  question,
  index
) => {
  if (
    !question ||
    typeof question !== "object"
  ) {
    return {
      id: index + 1,
      question: "",
      optionA: "",
      optionB: "",
      optionC: "",
      optionD: "",
      marks: 1,
    };
  }

  return {
    ...question,

    id:
      question.id ??
      question.question_id ??
      question.questionId ??
      index + 1,

    question:
      question.question ??
      question.question_text ??
      question.text ??
      "",

    optionA:
      question.optionA ??
      question.option_a ??
      "",

    optionB:
      question.optionB ??
      question.option_b ??
      "",

    optionC:
      question.optionC ??
      question.option_c ??
      "",

    optionD:
      question.optionD ??
      question.option_d ??
      "",

    marks:
      Number(
        question.marks ??
        question.mark ??
        1
      ),
  };
};

/* ============================================================
   PARSE QUESTIONS
============================================================ */

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
    const trimmed =
      value.trim();

    if (!trimmed) {
      return [];
    }

    try {
      const parsed =
        JSON.parse(trimmed);

      if (
        Array.isArray(parsed)
      ) {
        return parsed;
      }

      if (
        Array.isArray(
          parsed?.questions
        )
      ) {
        return parsed.questions;
      }

      return [];
    } catch {
      return [];
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
  }

  return [];
};

/* ============================================================
   EXTRACT QUESTIONS
============================================================ */

const extractQuestions = (
  payload
) => {
  const possibleValues = [
    payload?.assignment?.questions,
    payload?.questions,
    payload?.data?.assignment?.questions,
    payload?.data?.questions,
    payload?.result?.assignment?.questions,
    payload?.result?.questions,

    payload?.assignment?.questionData,
    payload?.questionData,
    payload?.data?.assignment?.questionData,
    payload?.data?.questionData,

    payload?.assignment?.items,
    payload?.items,
    payload?.data?.assignment?.items,
    payload?.data?.items,
  ];

  for (
    const candidate of possibleValues
  ) {
    const parsed =
      parseQuestionsValue(
        candidate
      );

    if (
      parsed.length
    ) {
      return parsed.map(
        (question, index) =>
          normalizeQuestion(
            question,
            index
          )
      );
    }
  }

  return [];
};

/* ============================================================
   EXTRACT ASSIGNMENT
============================================================ */

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

/* ============================================================
   ERROR
============================================================ */

const extractServerMessage = (
  data,
  fallback
) => {
  if (
    typeof data === "string" &&
    data.trim()
  ) {
    return data.trim();
  }

  const message =
    data?.message ||
    data?.error ||
    data?.details ||
    data?.reason ||
    data?.data?.message ||
    data?.data?.error ||
    data?.result?.message ||
    data?.result?.error;

  if (
    typeof message === "string" &&
    message.trim()
  ) {
    return message.trim();
  }

  return fallback;
};

/* ============================================================
   EXTRACT SUBMISSION
============================================================ */

const extractSubmission = (
  data
) => {
  return (
    data?.submission ||
    data?.data?.submission ||
    data?.result?.submission ||
    data?.result ||
    data?.data ||
    null
  );
};

/* ============================================================
   COMPONENT
============================================================ */

export default function StudentAssignmentDetails() {
  const navigate =
    useNavigate();

  const location =
    useLocation();

  const params =
    useParams();

  /* ==========================================================
     ASSIGNMENT ID
  ========================================================== */

  const assignmentId =
    useMemo(() => {
      return (
        params.assignmentId ||
        params.id ||
        params.assignment_id ||
        location.state?.assignment?.id ||
        location.state?.assignment?.assignmentId ||
        location.state?.assignment?.assignment_id ||
        ""
      );
    }, [
      params.assignmentId,
      params.id,
      params.assignment_id,
      location.state,
    ]);

  /* ==========================================================
     STATE
  ========================================================== */

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

  /* ==========================================================
     PROTECTED FILE STATE
  ========================================================== */

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
  ] = useState({
    studentReference: "",
    studentId: "",
    enrollmentId: "",
    studentName: "",
  });

  /* ==========================================================
     LOAD IDENTITY
  ========================================================== */

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

  /* ==========================================================
     LOAD ASSIGNMENT
  ========================================================== */

  const loadAssignment =
    useCallback(
      async () => {
        if (!assignmentId) {
          setError(
            "Assignment ID was not found."
          );

          setLoading(false);

          return;
        }

        const stateAssignment =
          location.state
            ?.assignment ||
          null;

        const stateDocument =
          location.state
            ?.document ||
          null;

        const stateFile =
          getAssignmentFile(
            stateDocument ||
              stateAssignment
          );

        try {
          setLoading(true);
          setError("");

          const token =
            getAcademyToken();

          if (!token) {
            throw new Error(
              "Your student session has expired. Please log in again."
            );
          }

          const response =
            await fetch(
              `${API_URL}/api/academy/student/assignments/${encodeURIComponent(
                assignmentId
              )}`,
              {
                method: "GET",

                credentials:
                  "include",

                headers:
                  getAuthHeaders(),
              }
            );

          const data =
            await response
              .json()
              .catch(
                () => ({})
              );

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

          console.log(
            "📎 DETAIL FILE FOUND:",
            detailFile
          );

          const mergedAssignment =
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

            if (
              finalFile.name
            ) {
              mergedAssignment.fileName =
                finalFile.name;
            }

            if (
              finalFile.type
            ) {
              mergedAssignment.fileType =
                finalFile.type;
            }

            if (
              finalFile.size !==
                null &&
              finalFile.size !==
                undefined
            ) {
              mergedAssignment.fileSize =
                finalFile.size;
            }
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
            const answerMap = {};

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
                  qid !== undefined &&
                  qid !== null
                ) {
                  answerMap[
                    String(qid)
                  ] = selected;
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

  /* ==========================================================
     ASSIGNMENT DOCUMENT
  ========================================================== */

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

  /* ==========================================================
     PROTECTED FILE ENDPOINT
  ========================================================== */

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

  /* ==========================================================
     LOAD PROTECTED FILE
  ========================================================== */

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
                method: "GET",

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

          /*
           * Some servers return application/octet-stream
           * even when the actual file is a PDF.
           *
           * Keep the server MIME type when available,
           * otherwise derive it from the assignment.
           */
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

  /* ==========================================================
     LOAD FILE WHEN ASSIGNMENT DOCUMENT EXISTS
  ========================================================== */

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

  /* ==========================================================
     CLEAN OBJECT URL
  ========================================================== */

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

  /* ==========================================================
     HANDLE ANSWER
  ========================================================== */

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

  /* ==========================================================
     SUBMIT ASSIGNMENT
  ========================================================== */

  const submitAssignment =
    async () => {
      if (!assignment?.id) {
        setSubmitError(
          "This assignment does not have a valid ID."
        );

        return;
      }

      if (!questions.length) {
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

        const answerMap = {};
        const answerList = [];

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
              method: "POST",

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

  /* ==========================================================
     OPEN PROTECTED DOCUMENT
  ========================================================== */

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

  /* ==========================================================
     DOWNLOAD PROTECTED DOCUMENT
  ========================================================== */

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

  /* ==========================================================
     RETRY FILE
  ========================================================== */

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

  /* ==========================================================
     BACK
  ========================================================== */

  const goBack = () => {
    navigate(
      "/academy/student/assignments"
    );
  };

  /* ==========================================================
     LOADING
  ========================================================== */

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

  /* ==========================================================
     ERROR
  ========================================================== */

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

  /* ==========================================================
     NO ASSIGNMENT
  ========================================================== */

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

  /* ==========================================================
     SUBMITTED
  ========================================================== */

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
              Your answers have been
              successfully submitted.
              Your tutor can now review
              your submission.
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

  /* ==========================================================
     MAIN PAGE
  ========================================================== */

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

            {/* ==================================================
                PROTECTED FILE ERROR
            ================================================== */}

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

            {/* ==================================================
                FILE LOADING
            ================================================== */}

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

            {/* ==================================================
                PDF
            ================================================== */}

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

            {/* ==================================================
                VIDEO
            ================================================== */}

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

            {/* ==================================================
                OTHER DOCUMENTS
            ================================================== */}

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
}
