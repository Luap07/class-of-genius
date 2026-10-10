import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";

import pool from "../lib/db.js";

import {
  resolveAuthenticatedStudent,
  normalizeSubject,
  normalizeClass,
} from "./academyEnrollmentRoutes.js";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDirectory = path.resolve(
  __dirname,
  "../uploads/academy-assignments"
);

fs.mkdirSync(uploadDirectory, { recursive: true });

const MAX_FILE_SIZE = 250 * 1024 * 1024;

const allowedExtensions = new Set([
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
  ".zip",
  ".mp4",
  ".webm",
  ".mov",
]);

/* ============================================================
   GENERAL HELPERS
============================================================ */

const clean = (value) =>
  value === undefined || value === null
    ? ""
    : String(value).trim();

const toNumber = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const parseJsonValue = (value, fallback = null) => {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  if (typeof value !== "string") {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const getGrade = (percentage) => {
  const score = Number(percentage) || 0;

  if (score >= 80) return "A";
  if (score >= 70) return "B";
  if (score >= 60) return "C";
  if (score >= 50) return "D";
  if (score >= 40) return "E";

  return "F";
};

const safeNormalizeClass = (value) => {
  const text = clean(value);

  if (!text) return "";

  try {
    const normalized = normalizeClass(text);

    if (normalized) {
      return clean(normalized)
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");
    }
  } catch {
    // Fall through to basic normalization.
  }

  return text.toLowerCase().replace(/[^a-z0-9]/g, "");
};

const classesMatch = (first, second) => {
  const a = safeNormalizeClass(first);
  const b = safeNormalizeClass(second);

  return Boolean(a && b && a === b);
};

const safeNormalizeSubject = (value) => {
  const text = clean(value);

  if (!text) return "";

  try {
    return clean(normalizeSubject(text)).toLowerCase();
  } catch {
    return text.toLowerCase();
  }
};

const subjectsMatch = (first, second) =>
  Boolean(
    safeNormalizeSubject(first) &&
      safeNormalizeSubject(first) ===
        safeNormalizeSubject(second)
  );

const tableExists = async (tableName) => {
  const result = await pool.query(
    `
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = $1
      ) AS exists
    `,
    [tableName]
  );

  return Boolean(result.rows[0]?.exists);
};

const getTableColumns = async (tableName) => {
  const result = await pool.query(
    `
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = $1
      ORDER BY ordinal_position
    `,
    [tableName]
  );

  return result.rows.map((row) => row.column_name);
};

const safeFileExists = (filePath) => {
  try {
    return Boolean(
      filePath &&
        fs.existsSync(filePath) &&
        fs.statSync(filePath).isFile()
    );
  } catch {
    return false;
  }
};

const removeUploadedFile = (filePath) => {
  if (safeFileExists(filePath)) {
    try {
      fs.unlinkSync(filePath);
    } catch (error) {
      console.error(
        "ASSIGNMENT FILE CLEANUP ERROR:",
        error
      );
    }
  }
};

const isValidId = (value) =>
  /^\d+$/.test(clean(value)) && Number(value) > 0;

/* ============================================================
   TUTOR REFERENCE
============================================================ */

const getTutorReference = (req) => {
  const candidates = [
    req.query?.tutorReference,
    req.query?.tutor_reference,
    req.query?.reference,
    req.query?.applicationReference,
    req.query?.application_reference,

    req.body?.tutorReference,
    req.body?.tutor_reference,
    req.body?.reference,
    req.body?.applicationReference,
    req.body?.application_reference,

    req.headers["x-tutor-reference"],
    req.headers["x-tutor-ref"],
  ];

  for (const candidate of candidates) {
    const value = clean(candidate);

    if (/^SQA-/i.test(value)) {
      return value;
    }
  }

  return "";
};

const isValidTutorReference = (reference) =>
  /^SQA-/i.test(clean(reference));

/* ============================================================
   FILE HELPERS
============================================================ */

const normalizeStoredFilePath = (value) =>
  clean(value).replace(/\\/g, "/").replace(/^\/+/, "");

const createFileUrl = (filename) => {
  if (!filename) return null;

  return `/uploads/academy-assignments/${encodeURIComponent(
    path.basename(filename)
  )}`;
};

const extractFileInfo = (assignment = {}) => {
  const filename =
    assignment.file_name ||
    assignment.filename ||
    assignment.fileName ||
    assignment.attachment_name ||
    assignment.attachmentName ||
    assignment.document_name ||
    assignment.documentName ||
    null;

  const filePath =
    assignment.file_path ||
    assignment.filePath ||
    assignment.attachment_path ||
    assignment.attachmentPath ||
    assignment.document_path ||
    assignment.documentPath ||
    null;

  const fileUrl =
    assignment.file_url ||
    assignment.fileUrl ||
    assignment.attachment_url ||
    assignment.attachmentUrl ||
    assignment.document_url ||
    assignment.documentUrl ||
    (filename ? createFileUrl(filename) : null);

  const fileType =
    assignment.file_type ||
    assignment.fileType ||
    assignment.mime_type ||
    assignment.attachment_type ||
    null;

  const fileSize =
    assignment.file_size ??
    assignment.fileSize ??
    null;

  return {
    filename,
    fileName: filename,
    filePath,
    file_path: filePath,
    fileUrl,
    file_url: fileUrl,
    fileType,
    file_type: fileType,
    fileSize,
    file_size: fileSize,
  };
};

const resolveAssignmentPhysicalFile = (assignment) => {
  const file = extractFileInfo(assignment);
  const candidates = [];

  const originalPath = clean(file.filePath);
  const storedPath = normalizeStoredFilePath(originalPath);

  const storedFilename = path.basename(
    storedPath || clean(file.filename)
  );

  const databaseFilename = path.basename(
    clean(file.filename)
  );

  if (originalPath && path.isAbsolute(originalPath)) {
    candidates.push(path.resolve(originalPath));
  }

  if (storedPath && !path.isAbsolute(originalPath)) {
    candidates.push(
      path.resolve(__dirname, "..", storedPath)
    );
  }

  if (storedFilename) {
    candidates.push(
      path.join(uploadDirectory, storedFilename)
    );
  }

  if (databaseFilename) {
    candidates.push(
      path.join(uploadDirectory, databaseFilename)
    );
  }

  const uniqueCandidates = [
    ...new Set(
      candidates.map((candidate) => path.resolve(candidate))
    ),
  ];

  const found = uniqueCandidates.find(safeFileExists);

  return {
    file,
    filename:
      databaseFilename ||
      storedFilename ||
      "assignment-file",
    candidates: uniqueCandidates,
    path: found || null,
  };
};

const getSubmissionFilePath = (storedValue) => {
  const value = clean(storedValue);

  if (!value) return null;

  /*
   * attachment_url stores the generated filename.
   * Never use a submitted URL as a filesystem path.
   */
  const filename = path.basename(value);

  if (!filename || filename !== value) {
    return null;
  }

  const candidate = path.resolve(
    uploadDirectory,
    filename
  );

  if (
    !candidate.startsWith(`${uploadDirectory}${path.sep}`)
  ) {
    return null;
  }

  return safeFileExists(candidate) ? candidate : null;
};

const getMimeType = (filePath, fallback = "") => {
  if (fallback) return fallback;

  const extension = path.extname(filePath).toLowerCase();

  const mimeTypes = {
    ".pdf": "application/pdf",
    ".doc": "application/msword",
    ".docx":
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".ppt": "application/vnd.ms-powerpoint",
    ".pptx":
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ".xls": "application/vnd.ms-excel",
    ".xlsx":
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ".txt": "text/plain",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".zip": "application/zip",
    ".mp4": "video/mp4",
    ".webm": "video/webm",
    ".mov": "video/quicktime",
  };

  return (
    mimeTypes[extension] ||
    "application/octet-stream"
  );
};

/* ============================================================
   CLASS HELPERS
============================================================ */

const getAssignmentClassColumns = async () => {
  const columns = await getTableColumns(
    "academy_assignments"
  );

  return [
    "class_name",
    "class",
    "grade",
    "className",
    "current_class",
    "student_class",
  ].filter((column) => columns.includes(column));
};

const getAssignmentClass = (assignment = {}) =>
  assignment.class_name ||
  assignment.className ||
  assignment.class ||
  assignment.grade ||
  assignment.current_class ||
  assignment.student_class ||
  "";

const buildAssignmentClassWhere = (
  classColumns,
  parameterNumber = 1
) => {
  if (!classColumns.length) {
    return { sql: "FALSE" };
  }

  const expressions = classColumns.map(
    (column) => `
      LOWER(
        REGEXP_REPLACE(
          COALESCE("${column}"::text, ''),
          '[^a-zA-Z0-9]',
          '',
          'g'
        )
      ) =
      LOWER(
        REGEXP_REPLACE(
          $${parameterNumber}::text,
          '[^a-zA-Z0-9]',
          '',
          'g'
        )
      )
    `
  );

  return {
    sql: `(${expressions.join(" OR ")})`,
  };
};

/* ============================================================
   QUESTIONS
============================================================ */

const formatQuestion = (question) => ({
  id: question.id,
  assignmentId: question.assignment_id,
  questionNumber: question.question_number ?? null,

  question:
    question.question ||
    question.question_text ||
    question.text ||
    "",

  questionText:
    question.question ||
    question.question_text ||
    question.text ||
    "",

  optionA: question.option_a || question.optionA || "",
  optionB: question.option_b || question.optionB || "",
  optionC: question.option_c || question.optionC || "",
  optionD: question.option_d || question.optionD || "",

  correctAnswer:
    question.correct_answer ||
    question.correctAnswer ||
    "",

  reason: question.reason || "",
  marks: toNumber(question.marks, 1),
  createdAt: question.created_at || null,
});

const getAssignmentQuestions = async (assignmentId) => {
  if (
    !(await tableExists("academy_assignment_questions"))
  ) {
    return [];
  }

  const columns = await getTableColumns(
    "academy_assignment_questions"
  );

  if (!columns.includes("assignment_id")) {
    return [];
  }

  const orderColumn = columns.includes("question_number")
    ? "question_number"
    : columns.includes("created_at")
      ? "created_at"
      : "id";

  const result = await pool.query(
    `
      SELECT *
      FROM academy_assignment_questions
      WHERE assignment_id = $1
      ORDER BY "${orderColumn}" ASC, id ASC
    `,
    [assignmentId]
  );

  return result.rows.map(formatQuestion);
};

/* ============================================================
   ASSIGNMENT FORMATTER
============================================================ */

const formatAssignment = (
  assignment,
  questions = [],
  submission = null
) => {
  const file = extractFileInfo(assignment);
  const assignmentClass = getAssignmentClass(assignment);
  const subject = clean(assignment.subject);

  const calculatedMaxScore = questions.reduce(
    (total, question) =>
      total + toNumber(question.marks, 1),
    0
  );

  const maxScore =
    submission?.max_score ?? calculatedMaxScore;

  const score = submission?.score ?? null;

  const percentage =
    submission?.percentage ??
    (
      score !== null && Number(maxScore) > 0
        ? Number(
            (
              (Number(score) / Number(maxScore)) *
              100
            ).toFixed(2)
          )
        : null
    );

  return {
    id: assignment.id,

    tutorReference: assignment.tutor_reference || null,
    tutorName: assignment.tutor_name || "Tutor",

    title: assignment.title || "Untitled Assignment",
    description: assignment.description || "",
    instructions: assignment.instructions || "",

    className: assignmentClass,
    class: assignmentClass,
    grade: assignment.grade || assignmentClass,

    subject,
    normalizedSubject: safeNormalizeSubject(subject),

    dueDate:
      assignment.due_date ||
      assignment.due_at ||
      null,

    due_date:
      assignment.due_date ||
      assignment.due_at ||
      null,

    status: assignment.status || "published",

    resultReleased: Boolean(assignment.result_released),
    result_released: Boolean(assignment.result_released),

    totalQuestions: toNumber(
      assignment.total_questions,
      questions.length
    ),

    total_questions: toNumber(
      assignment.total_questions,
      questions.length
    ),

    totalMarks: toNumber(
      assignment.total_marks,
      calculatedMaxScore
    ),

    total_marks: toNumber(
      assignment.total_marks,
      calculatedMaxScore
    ),

    fileName: file.fileName,
    filename: file.filename,
    file_name: file.fileName,

    fileUrl: file.fileUrl,
    file_url: file.file_url,

    filePath: file.filePath,
    file_path: file.file_path,

    fileType: file.fileType,
    file_type: file.file_type,

    fileSize: file.fileSize,
    file_size: file.file_size,

    attachmentName: file.fileName,
    attachment_name: file.fileName,

    attachmentUrl: file.fileUrl,
    attachment_url: file.file_url,

    file:
      file.fileName || file.filePath || file.fileUrl
        ? {
            name: file.fileName,
            fileName: file.fileName,
            url: file.fileUrl,
            fileUrl: file.fileUrl,
            path: file.filePath,
            filePath: file.filePath,
            type: file.fileType,
            size: file.fileSize,
          }
        : null,

    questions,
    submission,

    submissionStatus: submission?.status || "pending",
    submitted: Boolean(submission),

    score,
    maxScore,
    percentage,
    gradeResult: submission?.grade ?? null,
    submittedAt: submission?.submitted_at || null,

    createdAt: assignment.created_at || null,
    updatedAt: assignment.updated_at || null,
  };
};

/* ============================================================
   STUDENT AUTHENTICATION
============================================================ */

const authenticateStudent = async (req, res) => {
  try {
    const authenticated =
      await resolveAuthenticatedStudent(req);

    if (!authenticated?.student) {
      res.status(401).json({
        success: false,
        message:
          "Student authentication is required. Please log in again.",
      });

      return null;
    }

    const studentClass =
      authenticated.studentClass ||
      authenticated.serialized?.className ||
      authenticated.serialized?.class ||
      authenticated.serialized?.grade ||
      authenticated.student?.className ||
      authenticated.student?.class ||
      authenticated.student?.grade ||
      "";

    if (!studentClass) {
      res.status(400).json({
        success: false,
        message:
          "Your student profile does not have a class assigned. Please contact the administrator.",
      });

      return null;
    }

    return { ...authenticated, studentClass };
  } catch (error) {
    console.error("STUDENT AUTH ERROR:", error);

    res.status(error.status || 401).json({
      success: false,
      message:
        error.message ||
        "Student authentication is required. Please log in again.",
    });

    return null;
  }
};

const getAuthenticatedStudentReference = (
  authenticated
) => {
  const student = authenticated?.student || {};
  const serialized = authenticated?.serialized || {};
  const decoded = authenticated?.decoded || {};

  return clean(
    student.enrollment_id ||
      student.enrollmentId ||
      student.enrollment_reference ||
      student.enrollmentReference ||
      serialized.enrollment_id ||
      serialized.enrollmentId ||
      serialized.enrollment_reference ||
      serialized.enrollmentReference ||
      decoded.enrollment_id ||
      decoded.enrollmentId ||
      decoded.enrollment_reference ||
      decoded.enrollmentReference
  );
};

const getAuthenticatedStudentName = (authenticated) => {
  const student = authenticated?.student || {};
  const serialized = authenticated?.serialized || {};

  const firstName =
    student.first_name ||
    student.firstName ||
    serialized.first_name ||
    serialized.firstName ||
    "";

  const lastName =
    student.last_name ||
    student.lastName ||
    serialized.last_name ||
    serialized.lastName ||
    "";

  return (
    clean(
      student.full_name ||
        student.fullName ||
        serialized.full_name ||
        serialized.fullName ||
        `${firstName} ${lastName}`.trim()
    ) || "Student"
  );
};

/* ============================================================
   SUBMISSION HELPERS
============================================================ */

const getLatestStudentSubmission = async (
  assignmentId,
  enrollmentId
) => {
  if (!enrollmentId) return null;

  if (
    !(await tableExists("academy_assignment_submissions"))
  ) {
    return null;
  }

  const result = await pool.query(
    `
      SELECT *
      FROM academy_assignment_submissions
      WHERE assignment_id = $1
        AND enrollment_id = $2
      ORDER BY submitted_at DESC NULLS LAST, id DESC
      LIMIT 1
    `,
    [assignmentId, enrollmentId]
  );

  return result.rows[0] || null;
};

const getSubmissionAnswers = async (submissionId) => {
  if (
    !(await tableExists("academy_assignment_answers"))
  ) {
    return [];
  }

  const result = await pool.query(
    `
      SELECT
        aa.id,
        aa.submission_id,
        aa.question_id,
        aa.student_answer,
        aa.correct_answer,
        aa.is_correct,
        aa.marks_awarded,
        aa.created_at,

        aq.question_number,
        aq.question,
        aq.option_a,
        aq.option_b,
        aq.option_c,
        aq.option_d,
        aq.marks AS question_marks,
        aq.reason

      FROM academy_assignment_answers aa

      LEFT JOIN academy_assignment_questions aq
        ON aq.id = aa.question_id

      WHERE aa.submission_id = $1

      ORDER BY
        aq.question_number ASC NULLS LAST,
        aa.id ASC
    `,
    [submissionId]
  );

  return result.rows.map((row) => ({
    id: row.id,
    submissionId: row.submission_id,
    questionId: row.question_id,
    questionNumber: row.question_number ?? null,

    question: row.question || "",
    questionText: row.question || "",

    optionA: row.option_a || "",
    optionB: row.option_b || "",
    optionC: row.option_c || "",
    optionD: row.option_d || "",

    studentAnswer: row.student_answer || "",
    correctAnswer: row.correct_answer || "",
    isCorrect: Boolean(row.is_correct),

    marksAwarded: toNumber(row.marks_awarded, 0),
    questionMarks: toNumber(row.question_marks, 1),

    reason: row.reason || "",
    createdAt: row.created_at || null,
  }));
};

const verifyTutorOwnsAssignment = async (
  assignmentId,
  tutorReference
) => {
  const result = await pool.query(
    `
      SELECT *
      FROM academy_assignments
      WHERE id = $1
        AND tutor_reference = $2
      LIMIT 1
    `,
    [assignmentId, tutorReference]
  );

  return result.rows[0] || null;
};

/* ============================================================
   MULTER
============================================================ */

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, uploadDirectory);
  },

  filename: (_req, file, callback) => {
    const extension = path.extname(
      file.originalname || ""
    ).toLowerCase();

    const safeExtension = allowedExtensions.has(extension)
      ? extension
      : "";

    callback(
      null,
      `${Date.now()}-${crypto.randomBytes(10).toString("hex")}${safeExtension}`
    );
  },
});

const upload = multer({
  storage,

  limits: {
    fileSize: MAX_FILE_SIZE,
  },

  fileFilter: (_req, file, callback) => {
    const extension = path.extname(
      file.originalname || ""
    ).toLowerCase();

    if (!allowedExtensions.has(extension)) {
      return callback(
        new Error(
          `Unsupported file type: ${extension || "unknown"}`
        )
      );
    }

    callback(null, true);
  },
});

/*
 * Student submission files may use different field names in the
 * frontend. upload.any() prevents Multer's "Unexpected field"
 * error caused solely by a mismatched file field name.
 */
const assignmentSubmissionUpload = upload.any();

const getAssignmentSubmissionFile = (req) => {
  if (Array.isArray(req.files)) {
    return req.files[0] || null;
  }

  const files = req.files || {};

  return (
    files.file?.[0] ||
    files.submissionFile?.[0] ||
    files.submission_file?.[0] ||
    files.attachment?.[0] ||
    files.document?.[0] ||
    files.submission?.[0] ||
    null
  );
};

/* ============================================================
   CREATE TUTOR ASSIGNMENT
============================================================ */

router.post(
  "/tutor/assignments",
  upload.single("file"),
  async (req, res) => {
    let uploadedFilePath = req.file?.path || null;

    try {
      const tutorReference = getTutorReference(req);

      if (!isValidTutorReference(tutorReference)) {
        removeUploadedFile(uploadedFilePath);

        return res.status(401).json({
          success: false,
          message: "A valid SQA tutor reference is required.",
        });
      }

      const title = clean(req.body.title);
      const description = clean(req.body.description);
      const instructions = clean(req.body.instructions);

      const className = clean(
        req.body.class_name ||
          req.body.className ||
          req.body.class ||
          req.body.grade
      );

      const subject = clean(req.body.subject);

      const tutorName = clean(
        req.body.tutor_name || req.body.tutorName
      );

      const dueDate =
        clean(
          req.body.due_date ||
            req.body.dueDate ||
            req.body.due_at
        ) || null;

      if (title.length < 3) {
        removeUploadedFile(uploadedFilePath);

        return res.status(400).json({
          success: false,
          message:
            "Assignment title must be at least 3 characters.",
        });
      }

      if (!className || !subject) {
        removeUploadedFile(uploadedFilePath);

        return res.status(400).json({
          success: false,
          message: "Assignment class and subject are required.",
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Please upload the assignment file.",
        });
      }

      const assignmentColumns = await getTableColumns(
        "academy_assignments"
      );

      const questionsExist = await tableExists(
        "academy_assignment_questions"
      );

      const rawQuestions = parseJsonValue(
        req.body.questions,
        []
      );

      const questions = Array.isArray(rawQuestions)
        ? rawQuestions
        : [];

      const validQuestions = questions
        .map((question) => ({
          question: clean(
            question.question ||
              question.question_text ||
              question.text
          ),

          optionA: clean(
            question.optionA || question.option_a
          ),

          optionB: clean(
            question.optionB || question.option_b
          ),

          optionC: clean(
            question.optionC || question.option_c
          ),

          optionD: clean(
            question.optionD || question.option_d
          ),

          correctAnswer: clean(
            question.correctAnswer ||
              question.correct_answer
          ).toUpperCase(),

          reason: clean(question.reason),

          marks: Math.max(
            1,
            toNumber(question.marks, 1)
          ),
        }))
        .filter(
          (question) =>
            question.question &&
            question.optionA &&
            question.optionB &&
            question.optionC &&
            question.optionD &&
            ["A", "B", "C", "D"].includes(
              question.correctAnswer
            )
        );

      const totalQuestions = validQuestions.length;

      const totalMarks = validQuestions.reduce(
        (total, question) => total + question.marks,
        0
      );

      const filename = req.file.filename;
      const fileUrl = createFileUrl(filename);

      const relativeFilePath = path
        .relative(
          path.join(__dirname, ".."),
          req.file.path
        )
        .replace(/\\/g, "/");

      const columns = [];
      const values = [];
      const placeholders = [];

      const addColumn = (column, value) => {
        if (assignmentColumns.includes(column)) {
          columns.push(`"${column}"`);
          values.push(value);
          placeholders.push(`$${values.length}`);
        }
      };

      addColumn("tutor_reference", tutorReference);
      addColumn("tutor_name", tutorName || "Tutor");
      addColumn("title", title);
      addColumn("description", description);
      addColumn("instructions", instructions);

      addColumn("class_name", className);
      addColumn("class", className);
      addColumn("grade", className);
      addColumn("subject", subject);

      addColumn("due_date", dueDate);
      addColumn("due_at", dueDate);

      addColumn("status", "published");
      addColumn("result_released", false);
      addColumn("total_questions", totalQuestions);
      addColumn("total_marks", totalMarks);
      addColumn("max_score", totalMarks > 0 ? totalMarks : 100);

      addColumn("file_name", filename);
      addColumn("file_url", fileUrl);
      addColumn("file_path", relativeFilePath);
      addColumn("file_type", req.file.mimetype);
      addColumn("file_size", req.file.size);

      if (assignmentColumns.includes("created_at")) {
        addColumn("created_at", new Date());
      }

      if (!columns.includes('"title"')) {
        throw new Error(
          "The academy_assignments table is missing the title column."
        );
      }

      const client = await pool.connect();

      try {
        await client.query("BEGIN");

        const result = await client.query(
          `
            INSERT INTO academy_assignments
              (${columns.join(", ")})
            VALUES
              (${placeholders.join(", ")})
            RETURNING *
          `,
          values
        );

        const assignment = result.rows[0];

        if (questionsExist && validQuestions.length) {
          const questionColumns = await getTableColumns(
            "academy_assignment_questions"
          );

          for (
            let index = 0;
            index < validQuestions.length;
            index += 1
          ) {
            const question = validQuestions[index];

            const qColumns = [];
            const qValues = [];
            const qPlaceholders = [];

            const addQuestion = (column, value) => {
              if (questionColumns.includes(column)) {
                qColumns.push(`"${column}"`);
                qValues.push(value);
                qPlaceholders.push(`$${qValues.length}`);
              }
            };

            addQuestion("assignment_id", assignment.id);
            addQuestion("question_number", index + 1);
            addQuestion("question", question.question);
            addQuestion("question_text", question.question);
            addQuestion("option_a", question.optionA);
            addQuestion("option_b", question.optionB);
            addQuestion("option_c", question.optionC);
            addQuestion("option_d", question.optionD);
            addQuestion("correct_answer", question.correctAnswer);
            addQuestion("reason", question.reason);
            addQuestion("marks", question.marks);

            if (questionColumns.includes("created_at")) {
              addQuestion("created_at", new Date());
            }

            await client.query(
              `
                INSERT INTO academy_assignment_questions
                  (${qColumns.join(", ")})
                VALUES
                  (${qPlaceholders.join(", ")})
              `,
              qValues
            );
          }
        }

        await client.query("COMMIT");

        const finalQuestions = await getAssignmentQuestions(
          assignment.id
        );

        const formatted = formatAssignment(
          assignment,
          finalQuestions
        );

        uploadedFilePath = null;

        return res.status(201).json({
          success: true,
          message: "Assignment created successfully.",
          assignment: formatted,
          data: formatted,
        });
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error("CREATE ASSIGNMENT ERROR:", error);
      removeUploadedFile(uploadedFilePath);

      return res.status(500).json({
        success: false,
        message:
          error.message || "Unable to create assignment.",
      });
    }
  }
);

/* ============================================================
   GET TUTOR ASSIGNMENTS
============================================================ */

router.get("/tutor/assignments", async (req, res) => {
  try {
    const tutorReference = getTutorReference(req);

    if (!isValidTutorReference(tutorReference)) {
      return res.status(401).json({
        success: false,
        message: "A valid SQA tutor reference is required.",
      });
    }

    const columns = await getTableColumns(
      "academy_assignments"
    );

    const orderColumn = columns.includes("created_at")
      ? "created_at"
      : "id";

    const result = await pool.query(
      `
        SELECT *
        FROM academy_assignments
        WHERE tutor_reference = $1
        ORDER BY "${orderColumn}" DESC, id DESC
      `,
      [tutorReference]
    );

    const assignments = await Promise.all(
      result.rows.map(async (assignment) =>
        formatAssignment(
          assignment,
          await getAssignmentQuestions(assignment.id)
        )
      )
    );

    return res.json({
      success: true,
      assignments,
      data: assignments,
      results: assignments,
      count: assignments.length,
    });
  } catch (error) {
    console.error("TUTOR ASSIGNMENTS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load tutor assignments.",
    });
  }
});

/* ============================================================
   GET ONE TUTOR ASSIGNMENT
============================================================ */

router.get("/tutor/assignments/:id", async (req, res) => {
  try {
    const tutorReference = getTutorReference(req);

    if (!isValidTutorReference(tutorReference)) {
      return res.status(401).json({
        success: false,
        message: "A valid SQA tutor reference is required.",
      });
    }

    const assignment = await verifyTutorOwnsAssignment(
      req.params.id,
      tutorReference
    );

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found.",
      });
    }

    const formatted = formatAssignment(
      assignment,
      await getAssignmentQuestions(assignment.id)
    );

    return res.json({
      success: true,
      assignment: formatted,
      data: formatted,
    });
  } catch (error) {
    console.error("TUTOR ASSIGNMENT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load assignment.",
    });
  }
});

/* ============================================================
   GET STUDENT ASSIGNMENTS — MATCH STUDENT CLASS
============================================================ */

router.get("/student/assignments", async (req, res) => {
  try {
    const authenticated = await authenticateStudent(req, res);
    if (!authenticated) return;

    const studentClass = authenticated.studentClass;
    const requestedSubject = clean(req.query.subject);

    const assignmentColumns = await getTableColumns(
      "academy_assignments"
    );

    const classColumns = await getAssignmentClassColumns();

    if (!classColumns.length) {
      return res.status(500).json({
        success: false,
        message: "Assignment class fields could not be found.",
      });
    }

    const classWhere = buildAssignmentClassWhere(
      classColumns,
      1
    );

    const values = [studentClass];

    let whereSql = `WHERE ${classWhere.sql}`;

    if (
      requestedSubject &&
      assignmentColumns.includes("subject")
    ) {
      values.push(requestedSubject);

      whereSql += `
        AND LOWER(TRIM(subject::text)) =
            LOWER(TRIM($${values.length}::text))
      `;
    }

    if (assignmentColumns.includes("status")) {
      whereSql += `
        AND LOWER(COALESCE(status, 'published'))
            NOT IN ('deleted', 'archived')
      `;
    }

    const orderColumn = assignmentColumns.includes("created_at")
      ? "created_at"
      : "id";

    const result = await pool.query(
      `
        SELECT *
        FROM academy_assignments
        ${whereSql}
        ORDER BY "${orderColumn}" DESC, id DESC
      `,
      values
    );

    let assignmentRows = result.rows.filter((assignment) =>
      classesMatch(
        getAssignmentClass(assignment),
        studentClass
      )
    );

    if (requestedSubject) {
      assignmentRows = assignmentRows.filter((assignment) =>
        subjectsMatch(assignment.subject, requestedSubject)
      );
    }

    const enrollmentId =
      getAuthenticatedStudentReference(authenticated);

    const assignments = await Promise.all(
      assignmentRows.map(async (assignment) => {
        const questions = await getAssignmentQuestions(
          assignment.id
        );

        const submission = await getLatestStudentSubmission(
          assignment.id,
          enrollmentId
        );

        const studentQuestions = questions.map((question) => ({
          id: question.id,
          assignmentId: question.assignmentId,
          question: question.question,
          questionText: question.questionText,
          questionNumber: question.questionNumber,
          optionA: question.optionA,
          optionB: question.optionB,
          optionC: question.optionC,
          optionD: question.optionD,
          marks: question.marks,
        }));

        const formatted = formatAssignment(
          assignment,
          studentQuestions,
          submission
        );

        if (formatted.fileName) {
          formatted.fileUrl =
            `/api/academy/student/assignments/${encodeURIComponent(
              assignment.id
            )}/file`;

          formatted.file_url = formatted.fileUrl;

          formatted.file = {
            ...(formatted.file || {}),
            url: formatted.fileUrl,
            fileUrl: formatted.fileUrl,
          };
        }

        return formatted;
      })
    );

    const subjectMap = new Map();

    for (const assignment of assignments) {
      const subject = clean(assignment.subject);
      if (!subject) continue;

      const key = safeNormalizeSubject(subject);

      if (!subjectMap.has(key)) {
        subjectMap.set(key, {
          name: subject,
          normalizedName: key,
          count: 0,
        });
      }

      subjectMap.get(key).count += 1;
    }

    const subjects = Array.from(subjectMap.values()).sort(
      (a, b) => a.name.localeCompare(b.name)
    );

    return res.json({
      success: true,
      student: authenticated.serialized,
      class: studentClass,
      studentClass,
      subjects,
      assignments,
      data: assignments,
      results: assignments,
      count: assignments.length,
    });
  } catch (error) {
    console.error("STUDENT ASSIGNMENTS ERROR:", error);

    return res.status(error.status || 500).json({
      success: false,
      message:
        error.message || "Unable to load student assignments.",
    });
  }
});

/* ============================================================
   GET ONE STUDENT ASSIGNMENT
============================================================ */

router.get("/student/assignments/:id", async (req, res) => {
  try {
    const authenticated = await authenticateStudent(req, res);
    if (!authenticated) return;

    const studentClass = authenticated.studentClass;
    const classColumns = await getAssignmentClassColumns();

    const classWhere = buildAssignmentClassWhere(
      classColumns,
      2
    );

    const result = await pool.query(
      `
        SELECT *
        FROM academy_assignments
        WHERE id = $1
          AND ${classWhere.sql}
        LIMIT 1
      `,
      [req.params.id, studentClass]
    );

    const assignment = result.rows[0];

    if (
      !assignment ||
      !classesMatch(
        getAssignmentClass(assignment),
        studentClass
      )
    ) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found for your class.",
      });
    }

    const questions = await getAssignmentQuestions(
      assignment.id
    );

    const studentQuestions = questions.map((question) => ({
      id: question.id,
      assignmentId: question.assignmentId,
      question: question.question,
      questionText: question.questionText,
      questionNumber: question.questionNumber,
      optionA: question.optionA,
      optionB: question.optionB,
      optionC: question.optionC,
      optionD: question.optionD,
      marks: question.marks,
    }));

    const enrollmentId =
      getAuthenticatedStudentReference(authenticated);

    const submission = await getLatestStudentSubmission(
      assignment.id,
      enrollmentId
    );

    const formatted = formatAssignment(
      assignment,
      studentQuestions,
      submission
    );

    if (formatted.fileName) {
      formatted.fileUrl =
        `/api/academy/student/assignments/${encodeURIComponent(
          assignment.id
        )}/file`;

      formatted.file_url = formatted.fileUrl;

      formatted.file = {
        ...(formatted.file || {}),
        url: formatted.fileUrl,
        fileUrl: formatted.fileUrl,
      };
    }

    return res.json({
      success: true,
      student: authenticated.serialized,
      class: studentClass,
      assignment: formatted,
      data: formatted,
      submission,
    });
  } catch (error) {
    console.error("STUDENT ASSIGNMENT DETAIL ERROR:", error);

    return res.status(error.status || 500).json({
      success: false,
      message: error.message || "Unable to load assignment.",
    });
  }
});

/* ============================================================
   PROTECTED TUTOR ASSIGNMENT FILE
============================================================ */

router.get(
  "/student/assignments/:id/file",
  async (req, res) => {
    try {
      const authenticated = await authenticateStudent(req, res);
      if (!authenticated) return;

      const studentClass = authenticated.studentClass;
      const classColumns = await getAssignmentClassColumns();

      const classWhere = buildAssignmentClassWhere(
        classColumns,
        2
      );

      const result = await pool.query(
        `
          SELECT *
          FROM academy_assignments
          WHERE id = $1
            AND ${classWhere.sql}
          LIMIT 1
        `,
        [req.params.id, studentClass]
      );

      const assignment = result.rows[0];

      if (
        !assignment ||
        !classesMatch(
          getAssignmentClass(assignment),
          studentClass
        )
      ) {
        return res.status(404).json({
          success: false,
          message: "Assignment not found for your class.",
        });
      }

      const file = extractFileInfo(assignment);

      if (!file.filename && !file.filePath) {
        return res.status(404).json({
          success: false,
          message: "This assignment does not have a file.",
        });
      }

      const resolved =
        resolveAssignmentPhysicalFile(assignment);

      if (!resolved.path) {
        console.error(
          "STUDENT ASSIGNMENT FILE NOT FOUND",
          {
            assignmentId: req.params.id,
            databaseFileName: file.filename,
            databaseFilePath: file.filePath,
            uploadDirectory,
            candidates: resolved.candidates,
          }
        );

        return res.status(404).json({
          success: false,
          message: "Assignment file not found.",
        });
      }

      const displayFilename = path.basename(
        clean(file.filename) ||
          path.basename(resolved.path)
      );

      res.type(
        getMimeType(resolved.path, file.fileType)
      );

      res.setHeader(
        "Content-Disposition",
        `inline; filename="${encodeURIComponent(
          displayFilename
        )}"`
      );

      res.setHeader(
        "Cache-Control",
        "private, no-store, max-age=0"
      );

      return res.sendFile(resolved.path);
    } catch (error) {
      console.error("STUDENT FILE ERROR:", error);

      return res.status(error.status || 500).json({
        success: false,
        message:
          error.message || "Unable to open assignment file.",
      });
    }
  }
);

/* ============================================================
   SUBMIT STUDENT ASSIGNMENT — MCQ OR DOCUMENT

   FIX:
   - Accept any frontend file field name.
   - Support document-only assignments.
   - Keep student authentication and class restrictions.
   - Keep duplicate-submission protection.
============================================================ */

router.post(
  "/student/assignments/:id/submit",
  assignmentSubmissionUpload,
  async (req, res) => {
    const submittedFiles = Array.isArray(req.files)
      ? req.files
      : [];

    const submittedFile =
      getAssignmentSubmissionFile(req);

    const client = await pool.connect();

    let transactionStarted = false;
    let uploadedFilePath = submittedFile?.path || null;
    let keepUploadedFile = false;

    try {
      /*
       * This endpoint accepts only one uploaded document.
       * Remove all uploaded files if multiple were sent.
       */
      if (submittedFiles.length > 1) {
        submittedFiles.forEach((file) =>
          removeUploadedFile(file.path)
        );

        uploadedFilePath = null;

        return res.status(400).json({
          success: false,
          message:
            "Please upload only one document for this assignment.",
        });
      }

      const authenticated = await authenticateStudent(
        req,
        res
      );

      if (!authenticated) {
        removeUploadedFile(uploadedFilePath);
        uploadedFilePath = null;
        return;
      }

      if (!isValidId(req.params.id)) {
        removeUploadedFile(uploadedFilePath);
        uploadedFilePath = null;

        return res.status(400).json({
          success: false,
          message: "Invalid assignment ID.",
        });
      }

      const studentClass = authenticated.studentClass;

      const enrollmentId =
        getAuthenticatedStudentReference(authenticated);

      if (!enrollmentId) {
        removeUploadedFile(uploadedFilePath);
        uploadedFilePath = null;

        return res.status(400).json({
          success: false,
          message:
            "Your enrollment ID could not be determined. Please log out and log in again.",
        });
      }

      const classColumns =
        await getAssignmentClassColumns();

      const classWhere = buildAssignmentClassWhere(
        classColumns,
        2
      );

      const assignmentResult = await client.query(
        `
          SELECT *
          FROM academy_assignments
          WHERE id = $1
            AND ${classWhere.sql}
          LIMIT 1
        `,
        [req.params.id, studentClass]
      );

      const assignment = assignmentResult.rows[0];

      if (
        !assignment ||
        !classesMatch(
          getAssignmentClass(assignment),
          studentClass
        )
      ) {
        removeUploadedFile(uploadedFilePath);
        uploadedFilePath = null;

        return res.status(404).json({
          success: false,
          message: "Assignment not found for your class.",
        });
      }

      const questions = await getAssignmentQuestions(
        assignment.id
      );

      const isDocumentSubmission = Boolean(
        submittedFile
      );

      if (
        !questions.length &&
        !isDocumentSubmission
      ) {
        return res.status(400).json({
          success: false,
          message:
            "This assignment requires a document upload. Please select your completed file.",
        });
      }

      if (
        questions.length &&
        isDocumentSubmission
      ) {
        removeUploadedFile(uploadedFilePath);
        uploadedFilePath = null;

        return res.status(400).json({
          success: false,
          message:
            "This assignment contains questions. Please submit your answers instead of uploading a document.",
        });
      }

      if (
        !(await tableExists(
          "academy_assignment_submissions"
        ))
      ) {
        removeUploadedFile(uploadedFilePath);
        uploadedFilePath = null;

        return res.status(500).json({
          success: false,
          message:
            "Assignment submissions table was not found.",
        });
      }

      const submissionColumns = await getTableColumns(
        "academy_assignment_submissions"
      );

      const requiredSubmissionColumns = [
        "assignment_id",
        "enrollment_id",
      ];

      const missingSubmissionColumns =
        requiredSubmissionColumns.filter(
          (column) =>
            !submissionColumns.includes(column)
        );

      if (missingSubmissionColumns.length) {
        removeUploadedFile(uploadedFilePath);
        uploadedFilePath = null;

        return res.status(500).json({
          success: false,
          message:
            "The submissions table is missing required columns: " +
            missingSubmissionColumns.join(", "),
        });
      }

      /*
       * Prevent duplicate submissions for the same assignment.
       */
      await client.query("BEGIN");
      transactionStarted = true;

      const existingResult = await client.query(
        `
          SELECT *
          FROM academy_assignment_submissions
          WHERE assignment_id = $1
            AND enrollment_id = $2
          ORDER BY submitted_at DESC NULLS LAST, id DESC
          LIMIT 1
          FOR UPDATE
        `,
        [assignment.id, enrollmentId]
      );

      if (existingResult.rows.length) {
        await client.query("ROLLBACK");
        transactionStarted = false;

        removeUploadedFile(uploadedFilePath);
        uploadedFilePath = null;

        return res.status(409).json({
          success: false,
          message:
            "You have already submitted this assignment.",
          submission: existingResult.rows[0],
        });
      }

      const studentName =
        getAuthenticatedStudentName(authenticated);

      let score = null;
      let maxScore = null;
      let percentage = null;
      let grade = null;
      let gradedAnswers = [];
      let answerPayload = null;
      let storedAttachmentValue = null;

      if (isDocumentSubmission) {
        /*
         * Store the generated filename, not a user-provided path.
         */
        storedAttachmentValue = submittedFile.filename;
      } else {
        const rawAnswers = req.body?.answers;

        const answers = Array.isArray(rawAnswers)
          ? rawAnswers
          : rawAnswers &&
              typeof rawAnswers === "object"
            ? Object.entries(rawAnswers).map(
                ([questionId, studentAnswer]) => ({
                  questionId,
                  studentAnswer,
                })
              )
            : typeof rawAnswers === "string"
              ? parseJsonValue(rawAnswers, []).map(
                  (answer) => answer
                )
              : [];

        const answerMap = new Map();

        for (const answer of answers) {
          const questionId = clean(
            answer.questionId ||
              answer.question_id ||
              answer.id
          );

          const studentAnswer = clean(
            answer.studentAnswer ??
              answer.student_answer ??
              answer.answer
          ).toUpperCase();

          if (questionId) {
            answerMap.set(
              String(questionId),
              studentAnswer
            );
          }
        }

        const unanswered = questions.filter(
          (question) =>
            !answerMap.get(String(question.id))
        );

        if (unanswered.length) {
          await client.query("ROLLBACK");
          transactionStarted = false;

          return res.status(400).json({
            success: false,
            message:
              `Please answer all questions. ` +
              `${unanswered.length} question(s) remain unanswered.`,
          });
        }

        score = 0;
        maxScore = 0;

        gradedAnswers = questions.map((question) => {
          const marks = Math.max(
            1,
            toNumber(question.marks, 1)
          );

          maxScore += marks;

          const studentAnswer =
            answerMap.get(String(question.id)) || "";

          const correctAnswer =
            clean(question.correctAnswer).toUpperCase();

          const isCorrect =
            Boolean(studentAnswer) &&
            studentAnswer === correctAnswer;

          const marksAwarded = isCorrect ? marks : 0;

          score += marksAwarded;

          return {
            questionId: question.id,
            studentAnswer,
            correctAnswer,
            isCorrect,
            marksAwarded,
          };
        });

        percentage =
          maxScore > 0
            ? Number(
                ((score / maxScore) * 100).toFixed(2)
              )
            : 0;

        grade = getGrade(percentage);

        answerPayload = JSON.stringify(
          gradedAnswers.map((answer) => ({
            question_id: answer.questionId,
            student_answer: answer.studentAnswer,
          }))
        );
      }

      const submissionValuesByColumn = {
        assignment_id: assignment.id,
        enrollment_id: enrollmentId,
        student_name: studentName,
        answer: answerPayload,
        attachment_url: storedAttachmentValue,
        submitted_at: new Date(),
        score,
        feedback: null,
        status: "submitted",
      };

      const submissionInsertColumns = [];
      const submissionInsertValues = [];
      const submissionPlaceholders = [];

      for (const [column, value] of Object.entries(
        submissionValuesByColumn
      )) {
        if (submissionColumns.includes(column)) {
          submissionInsertColumns.push(`"${column}"`);
          submissionInsertValues.push(value);
          submissionPlaceholders.push(
            `$${submissionInsertValues.length}`
          );
        }
      }

      if (
        isDocumentSubmission &&
        !submissionColumns.includes("attachment_url")
      ) {
        await client.query("ROLLBACK");
        transactionStarted = false;

        removeUploadedFile(uploadedFilePath);
        uploadedFilePath = null;

        return res.status(500).json({
          success: false,
          message:
            "The submissions table does not have an attachment_url column.",
        });
      }

      if (!submissionInsertColumns.length) {
        throw new Error(
          "No compatible columns were found for saving the assignment submission."
        );
      }

      const submissionResult = await client.query(
        `
          INSERT INTO academy_assignment_submissions
            (${submissionInsertColumns.join(", ")})
          VALUES
            (${submissionPlaceholders.join(", ")})
          RETURNING *
        `,
        submissionInsertValues
      );

      const submission = submissionResult.rows[0];

      if (!isDocumentSubmission) {
        if (
          !(await tableExists(
            "academy_assignment_answers"
          ))
        ) {
          throw new Error(
            "Assignment answers table was not found."
          );
        }

        const answerColumns = await getTableColumns(
          "academy_assignment_answers"
        );

        const requiredAnswerColumns = [
          "submission_id",
          "question_id",
          "student_answer",
          "correct_answer",
          "is_correct",
          "marks_awarded",
        ];

        const missingAnswerColumns =
          requiredAnswerColumns.filter(
            (column) => !answerColumns.includes(column)
          );

        if (missingAnswerColumns.length) {
          throw new Error(
            "The answers table is missing required columns: " +
              missingAnswerColumns.join(", ")
          );
        }

        for (const answer of gradedAnswers) {
          await client.query(
            `
              INSERT INTO academy_assignment_answers
                (
                  submission_id,
                  question_id,
                  student_answer,
                  correct_answer,
                  is_correct,
                  marks_awarded
                )
              VALUES ($1, $2, $3, $4, $5, $6)
            `,
            [
              submission.id,
              answer.questionId,
              answer.studentAnswer,
              answer.correctAnswer,
              answer.isCorrect,
              answer.marksAwarded,
            ]
          );
        }
      }

      await client.query("COMMIT");
      transactionStarted = false;

      keepUploadedFile = isDocumentSubmission;

      const protectedAttachmentUrl =
        isDocumentSubmission
          ? `/api/academy/student/assignments/${encodeURIComponent(
              assignment.id
            )}/submission-file`
          : null;

      return res.status(201).json({
        success: true,

        message: isDocumentSubmission
          ? "Your document has been submitted successfully."
          : "Assignment submitted successfully.",

        submission: {
          ...submission,

          submissionType: isDocumentSubmission
            ? "document"
            : "questions",

          attachmentUrl: protectedAttachmentUrl,
          attachment_url: protectedAttachmentUrl,

          attachmentName:
            submittedFile?.originalname || null,

          attachmentSize:
            submittedFile?.size || null,

          max_score: maxScore,
          percentage,
          grade,
        },

        result: isDocumentSubmission
          ? null
          : {
              score,
              maxScore,
              percentage,
              grade,
            },
      });
    } catch (error) {
      if (transactionStarted) {
        try {
          await client.query("ROLLBACK");
        } catch {
          // Ignore rollback errors.
        }
      }

      console.error("STUDENT SUBMISSION ERROR:", error);

      return res.status(error.status || 500).json({
        success: false,
        message:
          error.message || "Unable to submit assignment.",
      });
    } finally {
      if (!keepUploadedFile && uploadedFilePath) {
        removeUploadedFile(uploadedFilePath);
      }

      client.release();
    }
  }
);

/* ============================================================
   PROTECTED STUDENT SUBMISSION FILE
============================================================ */

router.get(
  "/student/assignments/:id/submission-file",
  async (req, res) => {
    try {
      const authenticated = await authenticateStudent(
        req,
        res
      );

      if (!authenticated) return;

      const enrollmentId =
        getAuthenticatedStudentReference(authenticated);

      if (!enrollmentId) {
        return res.status(400).json({
          success: false,
          message:
            "Your enrollment ID could not be determined.",
        });
      }

      const classColumns =
        await getAssignmentClassColumns();

      const classWhere = buildAssignmentClassWhere(
        classColumns,
        2
      );

      const result = await pool.query(
        `
          SELECT
            s.*,
            a.title AS assignment_title,
            a.file_name AS assignment_file_name,
            a.file_path AS assignment_file_path,
            a.file_url AS assignment_file_url,
            a.file_type AS assignment_file_type,
            a.file_size AS assignment_file_size,
            a.grade,
            a.class_name,
            a.subject
          FROM academy_assignment_submissions s
          INNER JOIN academy_assignments a
            ON a.id = s.assignment_id
          WHERE s.assignment_id = $1
            AND ${classWhere.sql}
            AND s.enrollment_id = $3
          ORDER BY s.submitted_at DESC NULLS LAST, s.id DESC
          LIMIT 1
        `,
        [
          req.params.id,
          authenticated.studentClass,
          enrollmentId,
        ]
      );

      const submission = result.rows[0];

      if (!submission) {
        return res.status(404).json({
          success: false,
          message: "Submitted document not found.",
        });
      }

      const filePath = getSubmissionFilePath(
        submission.attachment_url
      );

      if (!filePath) {
        return res.status(404).json({
          success: false,
          message:
            "The submitted document file could not be found.",
        });
      }

      const extension = path.extname(filePath).toLowerCase();

      res.type(getMimeType(filePath));

      res.setHeader(
        "Content-Disposition",
        `inline; filename="student-submission${extension}"`
      );

      res.setHeader(
        "Cache-Control",
        "private, no-store, max-age=0"
      );

      return res.sendFile(filePath);
    } catch (error) {
      console.error(
        "STUDENT SUBMISSION FILE ERROR:",
        error
      );

      return res.status(error.status || 500).json({
        success: false,
        message:
          error.message ||
          "Unable to open submitted document.",
      });
    }
  }
);

/* ============================================================
   STUDENT RESULT — LOAD SUBMISSION AND ANSWERS
============================================================ */

router.get(
  "/student/assignments/:id/result",
  async (req, res) => {
    try {
      const authenticated = await authenticateStudent(
        req,
        res
      );

      if (!authenticated) return;

      const studentClass = authenticated.studentClass;

      const enrollmentId =
        getAuthenticatedStudentReference(authenticated);

      if (!enrollmentId) {
        return res.status(400).json({
          success: false,
          message:
            "Your enrollment ID could not be determined.",
        });
      }

      const classColumns =
        await getAssignmentClassColumns();

      const classWhere = buildAssignmentClassWhere(
        classColumns,
        2
      );

      const assignmentResult = await pool.query(
        `
          SELECT *
          FROM academy_assignments
          WHERE id = $1
            AND ${classWhere.sql}
          LIMIT 1
        `,
        [req.params.id, studentClass]
      );

      const assignment = assignmentResult.rows[0];

      if (
        !assignment ||
        !classesMatch(
          getAssignmentClass(assignment),
          studentClass
        )
      ) {
        return res.status(404).json({
          success: false,
          message: "Assignment not found for your class.",
        });
      }

      const submission = await getLatestStudentSubmission(
        assignment.id,
        enrollmentId
      );

      if (!submission) {
        return res.status(404).json({
          success: false,
          message:
            "Result not found. This assignment has not been submitted yet.",
        });
      }

      const answers = await getSubmissionAnswers(
        submission.id
      );

      const questions = await getAssignmentQuestions(
        assignment.id
      );

      const calculatedMaxScore = questions.reduce(
        (total, question) =>
          total + toNumber(question.marks, 1),
        0
      );

      const maxScore = calculatedMaxScore;
      const score = toNumber(submission.score, 0);

      const percentage =
        maxScore > 0
          ? Number(
              ((score / maxScore) * 100).toFixed(2)
            )
          : 0;

      const grade = getGrade(percentage);

      return res.json({
        success: true,

        assignment: {
          id: assignment.id,
          title: assignment.title,
          subject: assignment.subject || "",
          class: getAssignmentClass(assignment),
          resultReleased: Boolean(
            assignment.result_released
          ),
          result_released: Boolean(
            assignment.result_released
          ),
        },

        submission,
        answers,
        answerRecords: answers,

        result: {
          score,
          maxScore,
          max_score: maxScore,
          percentage,
          grade,
          status: submission.status || "submitted",
          submittedAt: submission.submitted_at || null,
        },
      });
    } catch (error) {
      console.error("STUDENT RESULT ERROR:", error);

      return res.status(error.status || 500).json({
        success: false,
        message:
          error.message ||
          "Unable to load assignment result.",
      });
    }
  }
);

/* ============================================================
   LEGACY FILE ACCESS
============================================================ */

router.get(
  "/assignment-files/:filename",
  async (req, res) => {
    try {
      const filename = path.basename(
        clean(req.params.filename)
      );

      if (!filename) {
        return res.status(400).json({
          success: false,
          message: "Invalid assignment file.",
        });
      }

      const filePath = path.resolve(
        uploadDirectory,
        filename
      );

      if (
        !filePath.startsWith(
          `${uploadDirectory}${path.sep}`
        ) ||
        !safeFileExists(filePath)
      ) {
        return res.status(404).json({
          success: false,
          message: "Assignment file not found.",
        });
      }

      res.type(getMimeType(filePath));

      return res.sendFile(filePath);
    } catch (error) {
      console.error("ASSIGNMENT FILE ERROR:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to open assignment file.",
      });
    }
  }
);

/* ============================================================
   MULTER / GENERAL ERROR HANDLER
============================================================ */

router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message:
          "The uploaded file is too large. Maximum size is 250 MB.",
      });
    }

    if (error.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        success: false,
        message:
          "Please upload only one file at a time.",
      });
    }

    return res.status(400).json({
      success: false,
      message: error.message || "File upload failed.",
    });
  }

  if (error) {
    console.error(
      "ACADEMY ASSIGNMENTS ERROR:",
      error
    );

    return res.status(400).json({
      success: false,
      message: error.message || "Request failed.",
    });
  }

  next();
});

export default router;
