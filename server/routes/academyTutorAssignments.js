
import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { fileURLToPath } from "url";
import pool from "../lib/db.js";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SERVER_ROOT = path.resolve(__dirname, "..");
const UPLOAD_DIR = path.join(SERVER_ROOT, "uploads", "academy-assignments");

fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const MAX_FILE_SIZE = 250 * 1024 * 1024;
const ALLOWED_EXTENSIONS = new Set([
  ".pdf", ".doc", ".docx", ".mp4", ".webm", ".mov",
]);

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "application/octet-stream",
]);

const clean = (value) =>
  value === undefined || value === null ? "" : String(value).trim();

const toNumber = (value, fallback = 0) => {
  if (value === undefined || value === null || value === "") return fallback;
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const safeIdentifier = (value) =>
  /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(value);

const quoteIdentifier = (value) => {
  if (!safeIdentifier(value)) throw new Error("Invalid database column.");
  return `"${value}"`;
};

const safeJsonParse = (value, fallback = null) => {
  if (value === undefined || value === null || value === "") return fallback;
  if (typeof value === "object") return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const normalizeTutorReference = (value) => {
  const candidates = clean(value)
    .split(",")
    .map((item) => item.trim());

  const reference = candidates.find((item) => /^SQA-[A-Z0-9-]+$/i.test(item));
  return reference ? reference.toUpperCase() : "";
};

const isValidTutorReference = (value) =>
  /^SQA-[A-Z0-9-]+$/.test(normalizeTutorReference(value));

const getTutorReference = (req) => {
  const candidates = [
    req.headers["x-tutor-reference"],
    req.headers["x-tutor-ref"],
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
  ];

  for (const candidate of candidates) {
    const reference = normalizeTutorReference(candidate);
    if (reference) return reference;
  }

  return "";
};

const getTutorName = (req) =>
  clean(
    req.body?.tutorName ??
    req.body?.tutor_name ??
    req.headers["x-tutor-name"]
  );

const tableColumnsCache = new Map();

const refreshTableColumns = (tableName) => {
  tableColumnsCache.delete(tableName);
};

const getTableColumns = async (tableName) => {
  if (!safeIdentifier(tableName)) {
    throw new Error("Invalid table name.");
  }

  if (tableColumnsCache.has(tableName)) {
    return tableColumnsCache.get(tableName);
  }

  const result = await pool.query(
    `SELECT column_name
       FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = $1
      ORDER BY ordinal_position`,
    [tableName]
  );

  const columns = new Set(result.rows.map((row) => row.column_name));
  tableColumnsCache.set(tableName, columns);
  return columns;
};

const tableExists = async (tableName) => {
  const result = await pool.query(
    `SELECT EXISTS (
       SELECT 1
         FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = $1
     ) AS exists`,
    [tableName]
  );

  return Boolean(result.rows[0]?.exists);
};

const getIdColumn = (columns) => {
  if (columns.has("id")) return "id";
  if (columns.has("assignment_id")) return "assignment_id";
  return "";
};

const getTutorReferenceColumn = (columns) => {
  if (columns.has("tutor_reference")) return "tutor_reference";
  if (columns.has("tutorReference")) return "tutorReference";
  return "";
};

const tutorReferenceCondition = (column, parameter = "$1") => `
  (
    UPPER(TRIM(${quoteIdentifier(column)})) = ${parameter}
    OR UPPER(TRIM(SPLIT_PART(${quoteIdentifier(column)}, ',', 1))) = ${parameter}
  )
`;

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => callback(null, UPLOAD_DIR),
  filename: (_req, file, callback) => {
    const extension = path.extname(file.originalname || "").toLowerCase();
    const safeExtension = ALLOWED_EXTENSIONS.has(extension) ? extension : "";
    callback(
      null,
      `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${safeExtension}`
    );
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1,
  },
  fileFilter: (_req, file, callback) => {
    const extension = path.extname(file.originalname || "").toLowerCase();
    const mime = clean(file.mimetype).toLowerCase();

    if (
      ALLOWED_EXTENSIONS.has(extension) ||
      ALLOWED_MIME_TYPES.has(mime)
    ) {
      return callback(null, true);
    }

    return callback(
      new Error("Allowed files: PDF, DOC, DOCX, MP4, WEBM and MOV.")
    );
  },
});

const getStoredFileName = (value) => {
  const normalized = clean(value).replace(/\\/g, "/").replace(/^\/+/, "");
  return normalized ? path.basename(normalized) : "";
};

const getFileUrl = (id) =>
  `/api/academy/tutor/assignments/${encodeURIComponent(id)}/file`;

const getUploadedFileData = (file) => {
  if (!file) return null;

  return {
    fileName: clean(file.originalname),
    filePath: path.relative(SERVER_ROOT, file.path).replace(/\\/g, "/"),
    fileType: clean(file.mimetype),
    fileSize: toNumber(file.size),
  };
};

const deleteStoredFile = async (filePath) => {
  const filename = getStoredFileName(filePath);
  if (!filename) return;

  try {
    await fs.promises.unlink(path.join(UPLOAD_DIR, filename));
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.error("Unable to delete assignment file:", error.message);
    }
  }
};

const normalizeQuestions = (value) => {
  const questions = Array.isArray(value) ? value : [];

  return questions
    .map((question, index) => {
      if (!question || typeof question !== "object") return null;

      const questionText = clean(
        question.questionText ??
        question.question_text ??
        question.question ??
        question.text
      );

      if (!questionText) return null;

      return {
        questionNumber: index + 1,
        questionText,
        optionA: clean(question.optionA ?? question.option_a ?? question.a),
        optionB: clean(question.optionB ?? question.option_b ?? question.b),
        optionC: clean(question.optionC ?? question.option_c ?? question.c),
        optionD: clean(question.optionD ?? question.option_d ?? question.d),
        correctAnswer: clean(
          question.correctAnswer ??
          question.correct_answer ??
          question.answer
        ),
        marks: toNumber(question.marks ?? question.max_marks, 1),
      };
    })
    .filter(Boolean);
};

const loadQuestions = async (assignmentId) => {
  try {
    if (!(await tableExists("academy_assignment_questions"))) return [];

    const columns = await getTableColumns("academy_assignment_questions");
    if (!columns.has("assignment_id")) return [];

    const orderBy = columns.has("question_number")
      ? "question_number ASC NULLS LAST"
      : columns.has("id")
        ? "id ASC"
        : "assignment_id ASC";

    const result = await pool.query(
      `SELECT *
         FROM academy_assignment_questions
        WHERE assignment_id::text = $1::text
        ORDER BY ${orderBy}`,
      [String(assignmentId)]
    );

    return result.rows.map((row, index) => {
      const questionText = clean(
        row.question_text ?? row.question ?? row.text
      );
      const optionA = clean(row.option_a ?? row.optionA ?? row.a);
      const optionB = clean(row.option_b ?? row.optionB ?? row.b);
      const optionC = clean(row.option_c ?? row.optionC ?? row.c);
      const optionD = clean(row.option_d ?? row.optionD ?? row.d);
      const correctAnswer = clean(
        row.correct_answer ?? row.answer ?? row.correctAnswer
      );
      const questionNumber = toNumber(row.question_number, index + 1);
      const marks = toNumber(row.marks ?? row.max_marks, 1);

      return {
        ...row,
        id: row.id ?? row.question_id ?? null,
        questionNumber,
        question_number: questionNumber,
        questionText,
        question_text: questionText,
        question: questionText,
        text: questionText,
        optionA,
        option_a: optionA,
        optionB,
        option_b: optionB,
        optionC,
        option_c: optionC,
        optionD,
        option_d: optionD,
        correctAnswer,
        correct_answer: correctAnswer,
        marks,
      };
    });
  } catch (error) {
    console.error("Unable to load assignment questions:", error.message);
    return [];
  }
};

const insertQuestions = async (client, assignmentId, questions) => {
  if (!questions.length) return;

  if (!(await tableExists("academy_assignment_questions"))) {
    throw new Error("The academy_assignment_questions table does not exist.");
  }

  const columns = await getTableColumns("academy_assignment_questions");

  if (!columns.has("assignment_id")) {
    throw new Error("The questions table is missing assignment_id.");
  }

  for (const question of questions) {
    const mappings = [
      ["assignment_id", assignmentId],
      ["question_number", question.questionNumber],
      ["question_text", question.questionText],
      ["question", question.questionText],
      ["text", question.questionText],
      ["option_a", question.optionA],
      ["option_b", question.optionB],
      ["option_c", question.optionC],
      ["option_d", question.optionD],
      ["correct_answer", question.correctAnswer],
      ["answer", question.correctAnswer],
      ["marks", question.marks],
      ["max_marks", question.marks],
    ].filter(([column]) => columns.has(column));

    const uniqueMappings = [];
    const used = new Set();

    for (const mapping of mappings) {
      if (!used.has(mapping[0])) {
        uniqueMappings.push(mapping);
        used.add(mapping[0]);
      }
    }

    if (!uniqueMappings.length) continue;

    const names = uniqueMappings.map(([column]) => quoteIdentifier(column));
    const values = uniqueMappings.map(([, value]) => value);
    const placeholders = values.map((_, index) => `$${index + 1}`);

    await client.query(
      `INSERT INTO academy_assignment_questions
         (${names.join(", ")})
       VALUES (${placeholders.join(", ")})`,
      values
    );
  }
};

const formatAssignment = async (row) => {
  if (!row) return null;

  const id = row.id ?? row.assignment_id;
  const fileName = clean(
    row.file_name ?? row.attachment_name ?? row.document_name
  ) || getStoredFileName(
    row.file_path ?? row.attachment_path ?? row.document_path
  );

  const filePath = clean(
    row.file_path ?? row.attachment_path ?? row.document_path
  );

  const fileUrl = filePath
    ? getFileUrl(id)
    : clean(row.file_url ?? row.attachment_url ?? row.document_url);

  const questions = await loadQuestions(id);
  const grade = clean(row.grade ?? row.class_name ?? row.class);
  const dueAt = row.due_at ?? row.due_date ?? null;
  const maxScore = toNumber(row.max_score ?? row.total_marks);
  const fileType = clean(row.file_type ?? row.mime_type);
  const fileSize = toNumber(row.file_size);

  return {
    ...row,
    id,
    assignment_id: id,
    tutor_reference: clean(row.tutor_reference),
    tutor_name: clean(row.tutor_name),
    title: clean(row.title),
    description: clean(row.description),
    instructions: clean(row.instructions),
    grade,
    class_name: clean(row.class_name ?? row.grade ?? row.class),
    class: clean(row.class ?? row.class_name ?? row.grade),
    subject: clean(row.subject),
    dueAt,
    due_at: dueAt,
    dueDate: dueAt,
    due_date: dueAt,
    maxScore,
    max_score: maxScore,
    total_marks: toNumber(row.total_marks ?? row.max_score),
    total_questions: toNumber(row.total_questions, questions.length),
    status: clean(row.status) || "published",
    result_released: Boolean(row.result_released),
    fileName,
    file_name: fileName,
    filePath,
    file_path: filePath,
    fileUrl,
    file_url: fileUrl,
    fileType,
    file_type: fileType,
    fileSize,
    file_size: fileSize,
    attachmentName: fileName,
    attachment_name: fileName,
    attachmentUrl: fileUrl,
    attachment_url: fileUrl,
    file: filePath || fileUrl || fileName
      ? {
          name: fileName,
          fileName,
          url: fileUrl,
          fileUrl,
          path: filePath,
          filePath,
          type: fileType,
          size: fileSize,
        }
      : null,
    questions,
  };
};

const findAssignmentForTutor = async (assignmentId, tutorReference) => {
  const columns = await getTableColumns("academy_assignments");
  const idColumn = getIdColumn(columns);
  const tutorColumn = getTutorReferenceColumn(columns);

  if (!idColumn || !tutorColumn) {
    throw new Error(
      "The assignments table must have an ID column and a tutor reference column."
    );
  }

  const result = await pool.query(
    `SELECT *
       FROM academy_assignments
      WHERE ${quoteIdentifier(idColumn)}::text = $1::text
        AND ${tutorReferenceCondition(tutorColumn, "$2")}
      LIMIT 1`,
    [String(assignmentId), tutorReference.toUpperCase()]
  );

  return result.rows[0] || null;
};

/* ============================================================
   LIST ASSIGNMENTS
   GET /api/academy/tutor/assignments
============================================================ */

router.get("/", async (req, res) => {
  try {
    const tutorReference = getTutorReference(req);

    if (!isValidTutorReference(tutorReference)) {
      return res.status(400).json({
        success: false,
        message: "A valid SQA tutor reference is required.",
        code: "INVALID_TUTOR_REFERENCE",
      });
    }

    if (!(await tableExists("academy_assignments"))) {
      return res.status(500).json({
        success: false,
        message: "The academy_assignments table does not exist.",
      });
    }

    const columns = await getTableColumns("academy_assignments");
    const idColumn = getIdColumn(columns);
    const tutorColumn = getTutorReferenceColumn(columns);

    if (!idColumn || !tutorColumn) {
      return res.status(500).json({
        success: false,
        message:
          "The assignments table is missing its ID or tutor reference column.",
      });
    }

    const orderBy = [];

    if (columns.has("created_at")) {
      orderBy.push('"created_at" DESC NULLS LAST');
    }

    orderBy.push(`${quoteIdentifier(idColumn)} DESC`);

    const result = await pool.query(
      `SELECT *
         FROM academy_assignments
        WHERE ${tutorReferenceCondition(tutorColumn, "$1")}
        ORDER BY ${orderBy.join(", ")}`,
      [tutorReference.toUpperCase()]
    );

    const assignments = await Promise.all(
      result.rows.map(async (row) => {
        try {
          return await formatAssignment(row);
        } catch (error) {
          console.error(
            "Unable to format assignment:",
            row.id ?? row.assignment_id,
            error.message
          );

          return {
            ...row,
            id: row.id ?? row.assignment_id,
            assignment_id: row.assignment_id ?? row.id,
            title: clean(row.title),
            description: clean(row.description),
            subject: clean(row.subject),
            grade: clean(row.grade ?? row.class_name ?? row.class),
            status: clean(row.status) || "published",
            questions: [],
          };
        }
      })
    );

    return res.json({
      success: true,
      assignments,
      data: assignments,
      results: assignments,
      count: assignments.length,
    });
  } catch (error) {
    console.error("GET tutor assignments error:", error.message, error.stack);

    return res.status(500).json({
      success: false,
      message: "Unable to load assignments.",
      error: error.message,
    });
  }
});

/* ============================================================
   CREATE ASSIGNMENT
============================================================ */

router.post("/", upload.single("file"), async (req, res) => {
  let client;
  const uploadedFile = req.file;

  try {
    const tutorReference = getTutorReference(req);

    if (!isValidTutorReference(tutorReference)) {
      if (uploadedFile) await deleteStoredFile(uploadedFile.path);

      return res.status(400).json({
        success: false,
        message: "A valid SQA tutor reference is required.",
      });
    }

    const title = clean(req.body.title);
    const grade = clean(
      req.body.grade ??
      req.body.class ??
      req.body.class_name ??
      req.body.className
    );
    const subject = clean(req.body.subject);
    const description = clean(req.body.description);
    const instructions = clean(req.body.instructions);
    const dueAt = clean(
      req.body.dueAt ??
      req.body.due_at ??
      req.body.dueDate ??
      req.body.due_date
    );
    const maxScore = toNumber(
      req.body.maxScore ??
      req.body.max_score ??
      req.body.totalMarks ??
      req.body.total_marks
    );
    const status = clean(req.body.status) || "published";
    const resultReleased = String(
      req.body.resultReleased ?? req.body.result_released ?? "false"
    ).toLowerCase() === "true";
    const questions = normalizeQuestions(
      safeJsonParse(req.body.questions, [])
    );

    if (!title || !grade || !subject) {
      if (uploadedFile) await deleteStoredFile(uploadedFile.path);

      return res.status(400).json({
        success: false,
        message: !title
          ? "Assignment title is required."
          : !grade
            ? "Class or grade is required."
            : "Subject is required.",
      });
    }

    if (!(await tableExists("academy_assignments"))) {
      throw new Error("The academy_assignments table does not exist.");
    }

    const columns = await getTableColumns("academy_assignments");
    const fileData = getUploadedFileData(uploadedFile);

    const mappings = [
      ["tutor_reference", tutorReference],
      ["tutor_name", getTutorName(req)],
      ["grade", grade],
      ["class_name", grade],
      ["class", grade],
      ["subject", subject],
      ["title", title],
      ["description", description],
      ["instructions", instructions],
      ["due_at", dueAt || null],
      ["due_date", dueAt || null],
      ["max_score", maxScore],
      ["total_marks", maxScore],
      ["total_questions", questions.length],
      ["status", status],
      ["result_released", resultReleased],
    ];

    if (fileData) {
      mappings.push(
        ["file_name", fileData.fileName],
        ["file_path", fileData.filePath],
        ["file_type", fileData.fileType],
        ["file_size", fileData.fileSize]
      );
    }

    const uniqueMappings = [];
    const usedColumns = new Set();

    for (const mapping of mappings) {
      if (columns.has(mapping[0]) && !usedColumns.has(mapping[0])) {
        uniqueMappings.push(mapping);
        usedColumns.add(mapping[0]);
      }
    }

    if (!uniqueMappings.some(([column]) => column === "title")) {
      throw new Error("The assignments table is missing the title column.");
    }

    if (!uniqueMappings.some(([column]) => column === "tutor_reference")) {
      throw new Error(
        "The assignments table is missing tutor_reference."
      );
    }

    const names = uniqueMappings.map(([column]) => quoteIdentifier(column));
    const values = uniqueMappings.map(([, value]) => value);
    const placeholders = values.map((_, index) => `$${index + 1}`);

    client = await pool.connect();
    await client.query("BEGIN");

    const insertResult = await client.query(
      `INSERT INTO academy_assignments (${names.join(", ")})
       VALUES (${placeholders.join(", ")})
       RETURNING *`,
      values
    );

    let assignment = insertResult.rows[0];
    const id = assignment.id ?? assignment.assignment_id;

    if (!id) {
      throw new Error("The database did not return the new assignment ID.");
    }

    if (fileData && columns.has("file_url")) {
      const fileUrl = getFileUrl(id);

      const idColumn = getIdColumn(columns);

      if (idColumn) {
        await client.query(
          `UPDATE academy_assignments
              SET file_url = $1
            WHERE ${quoteIdentifier(idColumn)}::text = $2::text`,
          [fileUrl, String(id)]
        );

        assignment.file_url = fileUrl;
      }
    }

    await insertQuestions(client, id, questions);
    await client.query("COMMIT");

    const finalAssignment = await findAssignmentForTutor(
      id,
      tutorReference
    );
    const formatted = await formatAssignment(finalAssignment || assignment);

    return res.status(201).json({
      success: true,
      message: "Assignment created successfully.",
      assignment: formatted,
      data: formatted,
    });
  } catch (error) {
    if (client) {
      try {
        await client.query("ROLLBACK");
      } catch {}
    }

    if (uploadedFile) await deleteStoredFile(uploadedFile.path);

    console.error("POST tutor assignment error:", error.message, error.stack);

    return res.status(500).json({
      success: false,
      message: "Unable to create assignment.",
      error: error.message,
    });
  } finally {
    if (client) client.release();
  }
});

/* ============================================================
   GET ASSIGNMENT FILE
============================================================ */

router.get("/:id/file", async (req, res) => {
  try {
    const tutorReference = getTutorReference(req);

    if (!isValidTutorReference(tutorReference)) {
      return res.status(400).json({
        success: false,
        message: "A valid SQA tutor reference is required.",
      });
    }

    const assignment = await findAssignmentForTutor(
      req.params.id,
      tutorReference
    );

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found or not owned by this tutor.",
      });
    }

    const fileName = getStoredFileName(
      assignment.file_path ??
      assignment.attachment_path ??
      assignment.document_path
    );

    if (!fileName) {
      return res.status(404).json({
        success: false,
        message: "No file is attached to this assignment.",
      });
    }

    const absolutePath = path.join(UPLOAD_DIR, fileName);

    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({
        success: false,
        message: "The uploaded file could not be found on the server.",
      });
    }

    res.setHeader(
      "Content-Type",
      clean(assignment.file_type) || "application/octet-stream"
    );
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${String(
        assignment.file_name || fileName
      ).replace(/["\r\n]/g, "")}"`
    );

    return res.sendFile(absolutePath);
  } catch (error) {
    console.error("GET assignment file error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to open assignment file.",
      error: error.message,
    });
  }
});

/* ============================================================
   GET SUBMISSIONS FOR AN ASSIGNMENT
============================================================ */

router.get("/:id/submissions", async (req, res) => {
  try {
    const tutorReference = getTutorReference(req);

    if (!isValidTutorReference(tutorReference)) {
      return res.status(400).json({
        success: false,
        message: "A valid SQA tutor reference is required.",
      });
    }

    const assignmentRow = await findAssignmentForTutor(
      req.params.id,
      tutorReference
    );

    if (!assignmentRow) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found or not owned by this tutor.",
      });
    }

    const assignment = await formatAssignment(assignmentRow);

    if (!(await tableExists("academy_assignment_submissions"))) {
      return res.json({
        success: true,
        assignment,
        submissions: [],
        data: [],
        count: 0,
      });
    }

    const columns = await getTableColumns("academy_assignment_submissions");

    if (!columns.has("assignment_id")) {
      throw new Error(
        "The submissions table is missing assignment_id."
      );
    }

    const orderBy = [];

    if (columns.has("submitted_at")) {
      orderBy.push("submitted_at DESC NULLS LAST");
    }

    if (columns.has("created_at")) {
      orderBy.push("created_at DESC NULLS LAST");
    }

    if (columns.has("id")) {
      orderBy.push("id DESC");
    }

    const result = await pool.query(
      `SELECT *
         FROM academy_assignment_submissions
        WHERE assignment_id::text = $1::text
        ${orderBy.length ? `ORDER BY ${orderBy.join(", ")}` : ""}`,
      [String(assignmentRow.id ?? assignmentRow.assignment_id)]
    );

    const submissions = result.rows.map((row) => {
      const id = row.id ?? row.submission_id;
      const score =
        row.score ??
        row.marks_obtained ??
        row.marks_awarded ??
        row.total_score ??
        null;
      const maxScore =
        row.max_score ??
        row.total_marks ??
        row.marks_available ??
        null;
      const studentName = clean(
        row.student_name ??
        row.student_full_name ??
        row.full_name ??
        row.name
      ) || `${clean(row.first_name)} ${clean(row.last_name)}`.trim() || "Student";

      const studentReference = clean(
        row.student_reference ??
        row.studentReference ??
        row.enrollment_reference ??
        row.student_id
      );

      const percentage =
        row.percentage ??
        (
          score !== null && maxScore !== null && Number(maxScore) > 0
            ? Number(((Number(score) / Number(maxScore)) * 100).toFixed(2))
            : null
        );

      return {
        ...row,
        id,
        submissionId: id,
        submission_id: id,
        assignmentId: row.assignment_id,
        assignment_id: row.assignment_id,
        studentName,
        student_name: studentName,
        studentReference,
        student_reference: studentReference,
        status: clean(row.status) || "submitted",
        submittedAt: row.submitted_at ?? row.created_at ?? null,
        submitted_at: row.submitted_at ?? row.created_at ?? null,
        score: score === null ? null : toNumber(score),
        marksAwarded: score === null ? null : toNumber(score),
        marks_awarded: score === null ? null : toNumber(score),
        maxScore: maxScore === null ? null : toNumber(maxScore),
        max_score: maxScore === null ? null : toNumber(maxScore),
        percentage: percentage === null ? null : toNumber(percentage),
        feedback: clean(row.feedback ?? row.tutor_feedback ?? row.comments),
      };
    });

    return res.json({
      success: true,
      assignment,
      submissions,
      data: submissions,
      count: submissions.length,
    });
  } catch (error) {
    console.error("GET tutor assignment submissions error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to load assignment submissions.",
      error: error.message,
    });
  }
});

/* ============================================================
   GET ONE SUBMISSION AND ITS ANSWERS
============================================================ */

router.get("/:id/submissions/:submissionId", async (req, res) => {
  try {
    const tutorReference = getTutorReference(req);

    if (!isValidTutorReference(tutorReference)) {
      return res.status(400).json({
        success: false,
        message: "A valid SQA tutor reference is required.",
      });
    }

    const assignmentRow = await findAssignmentForTutor(
      req.params.id,
      tutorReference
    );

    if (!assignmentRow) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found or not owned by this tutor.",
      });
    }

    if (!(await tableExists("academy_assignment_submissions"))) {
      return res.status(404).json({
        success: false,
        message: "No submissions were found.",
      });
    }

    const submissionColumns = await getTableColumns(
      "academy_assignment_submissions"
    );

    const submissionIdColumn = submissionColumns.has("id")
      ? "id"
      : submissionColumns.has("submission_id")
        ? "submission_id"
        : "";

    if (!submissionIdColumn || !submissionColumns.has("assignment_id")) {
      throw new Error("The submissions table has an incompatible schema.");
    }

    const submissionResult = await pool.query(
      `SELECT *
         FROM academy_assignment_submissions
        WHERE ${quoteIdentifier(submissionIdColumn)}::text = $1::text
          AND assignment_id::text = $2::text
        LIMIT 1`,
      [
        String(req.params.submissionId),
        String(assignmentRow.id ?? assignmentRow.assignment_id),
      ]
    );

    if (!submissionResult.rows.length) {
      return res.status(404).json({
        success: false,
        message: "Submission not found.",
      });
    }

    const submissionRow = submissionResult.rows[0];
    const submissionId = submissionRow.id ?? submissionRow.submission_id;
    let answers = [];

    if (await tableExists("academy_assignment_answers")) {
      const answerColumns = await getTableColumns(
        "academy_assignment_answers"
      );

      if (answerColumns.has("submission_id")) {
        const orderBy = answerColumns.has("id")
          ? "id ASC"
          : answerColumns.has("question_number")
            ? "question_number ASC"
            : "";

        const answerResult = await pool.query(
          `SELECT *
             FROM academy_assignment_answers
            WHERE submission_id::text = $1::text
            ${orderBy ? `ORDER BY ${orderBy}` : ""}`,
          [String(submissionId)]
        );

        answers = answerResult.rows;
      }
    }

    const score =
      submissionRow.score ??
      submissionRow.marks_obtained ??
      submissionRow.marks_awarded ??
      null;
    const maxScore =
      submissionRow.max_score ??
      submissionRow.total_marks ??
      null;

    const submission = {
      ...submissionRow,
      id: submissionId,
      submissionId,
      submission_id: submissionId,
      studentName: clean(
        submissionRow.student_name ??
        submissionRow.student_full_name ??
        submissionRow.full_name ??
        submissionRow.name
      ) || "Student",
      studentReference: clean(
        submissionRow.student_reference ??
        submissionRow.enrollment_reference ??
        submissionRow.student_id
      ),
      score: score === null ? null : toNumber(score),
      marks_awarded: score === null ? null : toNumber(score),
      max_score: maxScore === null ? null : toNumber(maxScore),
    };

    const assignment = await formatAssignment(assignmentRow);

    return res.json({
      success: true,
      assignment,
      submission,
      answers,
      data: {
        assignment,
        submission,
        answers,
      },
    });
  } catch (error) {
    console.error("GET submission details error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to load submission details.",
      error: error.message,
    });
  }
});

/* ============================================================
   GET ONE ASSIGNMENT
============================================================ */

router.get("/:id", async (req, res) => {
  try {
    const tutorReference = getTutorReference(req);

    if (!isValidTutorReference(tutorReference)) {
      return res.status(400).json({
        success: false,
        message: "A valid SQA tutor reference is required.",
      });
    }

    const row = await findAssignmentForTutor(
      req.params.id,
      tutorReference
    );

    if (!row) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found.",
      });
    }

    const assignment = await formatAssignment(row);

    return res.json({
      success: true,
      assignment,
      data: assignment,
    });
  } catch (error) {
    console.error("GET single assignment error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to load assignment.",
      error: error.message,
    });
  }
});

/* ============================================================
   UPDATE ASSIGNMENT
============================================================ */

router.patch("/:id", upload.single("file"), async (req, res) => {
  const uploadedFile = req.file;
  let client;

  try {
    const tutorReference = getTutorReference(req);

    if (!isValidTutorReference(tutorReference)) {
      if (uploadedFile) await deleteStoredFile(uploadedFile.path);

      return res.status(400).json({
        success: false,
        message: "A valid SQA tutor reference is required.",
      });
    }

    const existing = await findAssignmentForTutor(
      req.params.id,
      tutorReference
    );

    if (!existing) {
      if (uploadedFile) await deleteStoredFile(uploadedFile.path);

      return res.status(404).json({
        success: false,
        message: "Assignment not found.",
      });
    }

    const columns = await getTableColumns("academy_assignments");
    const idColumn = getIdColumn(columns);
    const tutorColumn = getTutorReferenceColumn(columns);
    const id = existing[idColumn];
    const updates = [];
    const values = [];
    const usedColumns = new Set();

    const addUpdate = (column, value) => {
      if (!columns.has(column) || usedColumns.has(column)) return;

      usedColumns.add(column);
      values.push(value);
      updates.push(`${quoteIdentifier(column)} = $${values.length}`);
    };

    if (req.body.title !== undefined) {
      addUpdate("title", clean(req.body.title));
    }

    if (req.body.description !== undefined) {
      addUpdate("description", clean(req.body.description));
    }

    if (req.body.instructions !== undefined) {
      addUpdate("instructions", clean(req.body.instructions));
    }

    if (
      req.body.grade !== undefined ||
      req.body.class !== undefined ||
      req.body.class_name !== undefined ||
      req.body.className !== undefined
    ) {
      const grade = clean(
        req.body.grade ??
        req.body.class ??
        req.body.class_name ??
        req.body.className
      );

      addUpdate("grade", grade);
      addUpdate("class_name", grade);
      addUpdate("class", grade);
    }

    if (req.body.subject !== undefined) {
      addUpdate("subject", clean(req.body.subject));
    }

    if (
      req.body.dueDate !== undefined ||
      req.body.due_date !== undefined ||
      req.body.dueAt !== undefined ||
      req.body.due_at !== undefined
    ) {
      const dueAt = clean(
        req.body.dueAt ??
        req.body.due_at ??
        req.body.dueDate ??
        req.body.due_date
      );

      addUpdate("due_at", dueAt || null);
      addUpdate("due_date", dueAt || null);
    }

    if (
      req.body.maxScore !== undefined ||
      req.body.max_score !== undefined ||
      req.body.totalMarks !== undefined ||
      req.body.total_marks !== undefined
    ) {
      const maxScore = toNumber(
        req.body.maxScore ??
        req.body.max_score ??
        req.body.totalMarks ??
        req.body.total_marks
      );

      addUpdate("max_score", maxScore);
      addUpdate("total_marks", maxScore);
    }

    if (req.body.status !== undefined) {
      addUpdate("status", clean(req.body.status));
    }

    if (
      req.body.resultReleased !== undefined ||
      req.body.result_released !== undefined
    ) {
      const released = String(
        req.body.resultReleased ?? req.body.result_released
      ).toLowerCase() === "true";

      addUpdate("result_released", released);
    }

    const rawQuestions = safeJsonParse(req.body.questions, null);
    const questionsProvided = Array.isArray(rawQuestions);
    const questions = questionsProvided
      ? normalizeQuestions(rawQuestions)
      : null;

    if (questionsProvided) {
      addUpdate("total_questions", questions.length);
    }

    const oldFilePath = clean(existing.file_path);

    if (uploadedFile) {
      const fileData = getUploadedFileData(uploadedFile);

      addUpdate("file_name", fileData.fileName);
      addUpdate("file_path", fileData.filePath);
      addUpdate("file_type", fileData.fileType);
      addUpdate("file_size", fileData.fileSize);
      addUpdate("file_url", getFileUrl(id));
    }

    if (columns.has("updated_at")) {
      updates.push('"updated_at" = CURRENT_TIMESTAMP');
    }

    client = await pool.connect();
    await client.query("BEGIN");

    let updatedAssignment = existing;

    if (updates.length) {
      values.push(String(id));
      const idParameter = values.length;

      values.push(tutorReference.toUpperCase());
      const tutorParameter = values.length;

      const result = await client.query(
        `UPDATE academy_assignments
            SET ${updates.join(", ")}
          WHERE ${quoteIdentifier(idColumn)}::text = $${idParameter}::text
            AND ${tutorReferenceCondition(tutorColumn, `$${tutorParameter}`)}
          RETURNING *`,
        values
      );

      if (!result.rows.length) {
        throw new Error("Assignment update was not authorized.");
      }

      updatedAssignment = result.rows[0];
    }

    if (
      questionsProvided &&
      await tableExists("academy_assignment_questions")
    ) {
      const questionColumns = await getTableColumns(
        "academy_assignment_questions"
      );

      if (questionColumns.has("assignment_id")) {
        await client.query(
          `DELETE FROM academy_assignment_questions
            WHERE assignment_id::text = $1::text`,
          [String(id)]
        );

        await insertQuestions(client, id, questions);
      }
    }

    await client.query("COMMIT");

    if (uploadedFile && oldFilePath) {
      await deleteStoredFile(oldFilePath);
    }

    const finalAssignment = await findAssignmentForTutor(
      id,
      tutorReference
    );
    const formatted = await formatAssignment(
      finalAssignment || updatedAssignment
    );

    return res.json({
      success: true,
      message: "Assignment updated successfully.",
      assignment: formatted,
      data: formatted,
    });
  } catch (error) {
    if (client) {
      try {
        await client.query("ROLLBACK");
      } catch {}
    }

    if (uploadedFile) await deleteStoredFile(uploadedFile.path);

    console.error("PATCH tutor assignment error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to update assignment.",
      error: error.message,
    });
  } finally {
    if (client) client.release();
  }
});

/* ============================================================
   DELETE ASSIGNMENT
============================================================ */

router.delete("/:id", async (req, res) => {
  let client;

  try {
    const tutorReference = getTutorReference(req);

    if (!isValidTutorReference(tutorReference)) {
      return res.status(400).json({
        success: false,
        message: "A valid SQA tutor reference is required.",
      });
    }

    const assignment = await findAssignmentForTutor(
      req.params.id,
      tutorReference
    );

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found.",
      });
    }

    const columns = await getTableColumns("academy_assignments");
    const idColumn = getIdColumn(columns);
    const tutorColumn = getTutorReferenceColumn(columns);
    const assignmentId = String(assignment[idColumn]);

    client = await pool.connect();
    await client.query("BEGIN");

    if (
      await tableExists("academy_assignment_answers") &&
      await tableExists("academy_assignment_submissions")
    ) {
      const answerColumns = await getTableColumns(
        "academy_assignment_answers"
      );
      const submissionColumns = await getTableColumns(
        "academy_assignment_submissions"
      );

      if (
        answerColumns.has("submission_id") &&
        submissionColumns.has("assignment_id") &&
        submissionColumns.has("id")
      ) {
        await client.query(
          `DELETE FROM academy_assignment_answers AS answer
            USING academy_assignment_submissions AS submission
            WHERE answer.submission_id::text = submission.id::text
              AND submission.assignment_id::text = $1::text`,
          [assignmentId]
        );
      }
    }

    if (await tableExists("academy_assignment_submissions")) {
      const submissionColumns = await getTableColumns(
        "academy_assignment_submissions"
      );

      if (submissionColumns.has("assignment_id")) {
        await client.query(
          `DELETE FROM academy_assignment_submissions
            WHERE assignment_id::text = $1::text`,
          [assignmentId]
        );
      }
    }

    if (await tableExists("academy_assignment_questions")) {
      const questionColumns = await getTableColumns(
        "academy_assignment_questions"
      );

      if (questionColumns.has("assignment_id")) {
        await client.query(
          `DELETE FROM academy_assignment_questions
            WHERE assignment_id::text = $1::text`,
          [assignmentId]
        );
      }
    }

    await client.query(
      `DELETE FROM academy_assignments
        WHERE ${quoteIdentifier(idColumn)}::text = $1::text
          AND ${tutorReferenceCondition(tutorColumn, "$2")}`,
      [assignmentId, tutorReference.toUpperCase()]
    );

    await client.query("COMMIT");
    await deleteStoredFile(assignment.file_path);

    return res.json({
      success: true,
      message: "Assignment deleted successfully.",
    });
  } catch (error) {
    if (client) {
      try {
        await client.query("ROLLBACK");
      } catch {}
    }

    console.error("DELETE tutor assignment error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to delete assignment.",
      error: error.message,
    });
  } finally {
    if (client) client.release();
  }
});

/* ============================================================
   UPLOAD ERROR HANDLER
============================================================ */

router.use((error, _req, res, _next) => {
  console.error("Tutor assignments route error:", error.message);

  if (error instanceof multer.MulterError) {
    const message = error.code === "LIMIT_FILE_SIZE"
      ? "The uploaded file is too large. Maximum size is 250 MB."
      : error.message || "Unable to upload file.";

    return res.status(400).json({
      success: false,
      message,
    });
  }

  return res.status(400).json({
    success: false,
    message: error.message || "Unable to process the request.",
  });
});

export default router;
