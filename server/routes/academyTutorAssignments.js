import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { fileURLToPath } from "url";

import pool from "../lib/db.js";

const router = express.Router();

/* ============================================================
   PATHS
============================================================ */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SERVER_ROOT = path.resolve(__dirname, "..");

const UPLOAD_DIR = path.join(
  SERVER_ROOT,
  "uploads",
  "academy-assignments"
);

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, {
    recursive: true,
  });
}

/* ============================================================
   MULTER
============================================================ */

const ALLOWED_EXTENSIONS = new Set([
  ".pdf",
  ".doc",
  ".docx",
  ".mp4",
  ".webm",
  ".mov",
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

const MAX_FILE_SIZE = 250 * 1024 * 1024;

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },

  filename: (_req, file, cb) => {
    const originalExt = path
      .extname(file.originalname || "")
      .toLowerCase();

    const safeExt = ALLOWED_EXTENSIONS.has(originalExt)
      ? originalExt
      : "";

    const uniqueName =
      `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${safeExt}`;

    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,

  limits: {
    fileSize: MAX_FILE_SIZE,
  },

  fileFilter: (_req, file, cb) => {
    const ext = path
      .extname(file.originalname || "")
      .toLowerCase();

    const mime = String(file.mimetype || "").toLowerCase();

    if (
      ALLOWED_EXTENSIONS.has(ext) ||
      ALLOWED_MIME_TYPES.has(mime)
    ) {
      return cb(null, true);
    }

    return cb(
      new Error(
        "Unsupported file type. Allowed files: PDF, DOC, DOCX, MP4, WEBM and MOV."
      )
    );
  },
});

/* ============================================================
   HELPERS
============================================================ */

const clean = (value) => {
  if (value === undefined || value === null) {
    return "";
  }

  return String(value).trim();
};

const toNumber = (value, fallback = 0) => {
  const n = Number(value);

  return Number.isFinite(n) ? n : fallback;
};

const safeJsonParse = (value, fallback = null) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return fallback;
  }

  if (typeof value === "object") {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const uniqueArray = (values = []) => {
  return [
    ...new Set(
      values
        .map((value) => clean(value))
        .filter(Boolean)
    ),
  ];
};

/* ============================================================
   TUTOR REFERENCE NORMALIZATION
============================================================ */

/*
  IMPORTANT:

  The tutor reference must always be the SQA application
  reference.

  Correct:
    SQA-677281-6D34

  Incorrect:
    0635004a-e160-4f76-aca3-e187ddd9c8a0

  Also handles the bad value that was previously being saved:

    SQA-677281-6D34, SQA-677281-6D34
*/

const normalizeTutorReference = (value) => {
  const reference = clean(value);

  if (!reference) {
    return "";
  }

  const references = reference
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  const validReference = references.find((item) =>
    /^SQA-[A-Z0-9-]+$/i.test(item)
  );

  return validReference
    ? validReference.toUpperCase()
    : "";
};

const isValidTutorReference = (value) => {
  const reference =
    normalizeTutorReference(value);

  return /^SQA-[A-Z0-9-]+$/i.test(reference);
};

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
    const reference =
      normalizeTutorReference(candidate);

    if (reference) {
      return reference;
    }
  }

  return "";
};

const getTutorName = (req) => {
  const candidates = [
    req.body?.tutorName,
    req.body?.tutor_name,
    req.headers["x-tutor-name"],
  ];

  for (const candidate of candidates) {
    const value = clean(candidate);

    if (value) {
      return value;
    }
  }

  return "";
};

/* ============================================================
   SQL IDENTIFIER HELPERS
============================================================ */

const safeIdentifier = (identifier) => {
  return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(
    identifier
  );
};

const quoteIdentifier = (identifier) => {
  if (!safeIdentifier(identifier)) {
    throw new Error(
      `Unsafe SQL identifier: ${identifier}`
    );
  }

  return `"${identifier}"`;
};

/* ============================================================
   TABLE COLUMN HELPERS
============================================================ */

const tableColumnsCache = new Map();

const getTableColumns = async (tableName) => {
  if (tableColumnsCache.has(tableName)) {
    return tableColumnsCache.get(tableName);
  }

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

  const columns = new Set(
    result.rows.map(
      (row) => row.column_name
    )
  );

  tableColumnsCache.set(
    tableName,
    columns
  );

  return columns;
};

const refreshTableColumns = (tableName) => {
  tableColumnsCache.delete(
    tableName
  );
};

/* ============================================================
   ENSURE FILE COLUMNS EXIST
============================================================ */

const ensureFileColumns = async () => {
  await pool.query(`
    ALTER TABLE academy_assignments
      ADD COLUMN IF NOT EXISTS file_name TEXT,
      ADD COLUMN IF NOT EXISTS file_url TEXT,
      ADD COLUMN IF NOT EXISTS file_type TEXT,
      ADD COLUMN IF NOT EXISTS file_size BIGINT,
      ADD COLUMN IF NOT EXISTS file_path TEXT
  `);

  refreshTableColumns(
    "academy_assignments"
  );
};

/* ============================================================
   FILE HELPERS
============================================================ */

const normalizeStoredFilePath = (value) => {
  const input = clean(value);

  if (!input) {
    return "";
  }

  return input
    .replace(/\\/g, "/")
    .replace(/^\/+/, "");
};

const getStoredFileName = (filePath) => {
  const normalized =
    normalizeStoredFilePath(filePath);

  if (!normalized) {
    return "";
  }

  return path.basename(
    normalized
  );
};

const getFileUrl = (assignmentId) => {
  return `/api/academy/tutor/assignments/${encodeURIComponent(
    assignmentId
  )}/file`;
};

const deleteStoredFile = async (
  filePath
) => {
  const normalized =
    normalizeStoredFilePath(filePath);

  if (!normalized) {
    return;
  }

  const basename =
    path.basename(normalized);

  if (!basename) {
    return;
  }

  const absolutePath =
    path.join(
      UPLOAD_DIR,
      basename
    );

  try {
    await fs.promises.unlink(
      absolutePath
    );
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.error(
        "Unable to delete assignment file:",
        error
      );
    }
  }
};

const getUploadedFileData = (
  file
) => {
  if (!file) {
    return null;
  }

  const storedPath =
    path
      .relative(
        SERVER_ROOT,
        file.path
      )
      .replace(/\\/g, "/");

  return {
    fileName: clean(
      file.originalname
    ),

    filePath: storedPath,

    fileType: clean(
      file.mimetype
    ),

    fileSize: toNumber(
      file.size,
      0
    ),
  };
};

/* ============================================================
   QUESTION HELPERS
============================================================ */

const normalizeQuestions = (
  rawQuestions
) => {
  let questions =
    rawQuestions;

  if (!Array.isArray(questions)) {
    questions = [];
  }

  return questions
    .map((question, index) => {
      if (
        !question ||
        typeof question !== "object"
      ) {
        return null;
      }

      const questionText = clean(
        question.questionText ??
        question.question_text ??
        question.question ??
        question.text
      );

      const optionA = clean(
        question.optionA ??
        question.option_a ??
        question.a
      );

      const optionB = clean(
        question.optionB ??
        question.option_b ??
        question.b
      );

      const optionC = clean(
        question.optionC ??
        question.option_c ??
        question.c
      );

      const optionD = clean(
        question.optionD ??
        question.option_d ??
        question.d
      );

      const correctAnswer = clean(
        question.correctAnswer ??
        question.correct_answer ??
        question.answer
      );

      const marks = toNumber(
        question.marks ??
        question.maxMarks ??
        question.max_marks,
        1
      );

      if (!questionText) {
        return null;
      }

      return {
        questionText,
        optionA,
        optionB,
        optionC,
        optionD,
        correctAnswer,
        marks,
        questionNumber:
          index + 1,
      };
    })
    .filter(Boolean);
};

/* ============================================================
   INSERT QUESTIONS
============================================================ */

const insertQuestions = async (
  client,
  assignmentId,
  questions
) => {
  if (!questions.length) {
    return;
  }

  const columns =
    await getTableColumns(
      "academy_assignment_questions"
    );

  if (!columns.size) {
    return;
  }

  for (const question of questions) {
    const finalColumns = [];
    const finalValues = [];
    const finalPlaceholders = [];

    const mappings = [
      [
        "assignment_id",
        assignmentId,
      ],

      [
        "question_number",
        question.questionNumber,
      ],

      [
        "question_text",
        question.questionText,
      ],

      [
        "question",
        question.questionText,
      ],

      [
        "text",
        question.questionText,
      ],

      [
        "option_a",
        question.optionA,
      ],

      [
        "option_b",
        question.optionB,
      ],

      [
        "option_c",
        question.optionC,
      ],

      [
        "option_d",
        question.optionD,
      ],

      [
        "correct_answer",
        question.correctAnswer,
      ],

      [
        "answer",
        question.correctAnswer,
      ],

      [
        "marks",
        question.marks,
      ],

      [
        "max_marks",
        question.marks,
      ],
    ];

    for (
      const [column, value] of mappings
    ) {
      if (!columns.has(column)) {
        continue;
      }

      finalColumns.push(
        column
      );

      finalValues.push(
        value
      );

      finalPlaceholders.push(
        `$${finalValues.length}`
      );
    }

    if (!finalColumns.length) {
      continue;
    }

    const sql = `
      INSERT INTO academy_assignment_questions
      (${finalColumns
        .map(quoteIdentifier)
        .join(", ")})
      VALUES (${finalPlaceholders.join(", ")})
    `;

    await client.query(
      sql,
      finalValues
    );
  }
};

/* ============================================================
   LOAD QUESTIONS
============================================================ */

const loadQuestions = async (
  assignmentId
) => {
  try {
    const columns =
      await getTableColumns(
        "academy_assignment_questions"
      );

    if (
      !columns.has(
        "assignment_id"
      )
    ) {
      return [];
    }

    const orderColumn =
      columns.has(
        "question_number"
      )
        ? `
            CASE
              WHEN question_number IS NULL
              THEN id
              ELSE question_number
            END ASC,
            id ASC
          `
        : `id ASC`;

    const result =
      await pool.query(
        `
          SELECT *
          FROM academy_assignment_questions
          WHERE assignment_id = $1
          ORDER BY ${orderColumn}
        `,
        [assignmentId]
      );

    return result.rows;
  } catch (error) {
    console.error(
      "Unable to load assignment questions:",
      error
    );

    return [];
  }
};

/* ============================================================
   FORMAT QUESTION
============================================================ */

const formatQuestion = (
  row,
  index
) => {
  const questionText = clean(
    row.question_text ??
    row.question ??
    row.text
  );

  const optionA = clean(
    row.option_a ??
    row.optionA ??
    row.a
  );

  const optionB = clean(
    row.option_b ??
    row.optionB ??
    row.b
  );

  const optionC = clean(
    row.option_c ??
    row.optionC ??
    row.c
  );

  const optionD = clean(
    row.option_d ??
    row.optionD ??
    row.d
  );

  const correctAnswer = clean(
    row.correct_answer ??
    row.answer ??
    row.correctAnswer
  );

  const marks = toNumber(
    row.marks ??
    row.max_marks,
    1
  );

  return {
    ...row,

    id:
      row.id ??
      row.question_id,

    assignment_id:
      row.assignment_id,

    question_number:
      toNumber(
        row.question_number,
        index + 1
      ),

    questionText,

    question_text:
      questionText,

    question:
      questionText,

    text:
      questionText,

    optionA,

    option_a:
      optionA,

    optionB,

    option_b:
      optionB,

    optionC,

    option_c:
      optionC,

    optionD,

    option_d:
      optionD,

    correctAnswer,

    correct_answer:
      correctAnswer,

    answer:
      correctAnswer,

    marks,

    max_marks:
      marks,
  };
};

/* ============================================================
   FORMAT ASSIGNMENT
============================================================ */

const formatAssignment = async (
  row
) => {
  if (!row) {
    return null;
  }

  const assignmentId =
    row.id ??
    row.assignment_id;

  let fileName = clean(
    row.file_name ??
    row.attachment_name ??
    row.document_name
  );

  const filePath = clean(
    row.file_path ??
    row.attachment_path ??
    row.document_path
  );

  if (
    !fileName &&
    filePath
  ) {
    fileName =
      getStoredFileName(
        filePath
      );
  }

  const fileUrl =
    filePath
      ? getFileUrl(
          assignmentId
        )
      : clean(
          row.file_url ??
          row.attachment_url ??
          row.document_url
        );

  const rawQuestions =
    await loadQuestions(
      assignmentId
    );

  const questions =
    rawQuestions.map(
      formatQuestion
    );

  return {
    ...row,

    id: assignmentId,

    assignment_id:
      assignmentId,

    tutor_reference:
      clean(
        row.tutor_reference
      ),

    tutor_name:
      clean(
        row.tutor_name
      ),

    grade: clean(
      row.grade ??
      row.class_name ??
      row.class
    ),

    class_name: clean(
      row.class_name ??
      row.grade ??
      row.class
    ),

    class: clean(
      row.class ??
      row.class_name ??
      row.grade
    ),

    subject:
      clean(row.subject),

    title:
      clean(row.title),

    description:
      clean(row.description),

    instructions:
      clean(row.instructions),

    due_at:
      row.due_at ??
      row.due_date ??
      null,

    due_date:
      row.due_date ??
      row.due_at ??
      null,

    max_score:
      toNumber(
        row.max_score ??
        row.total_marks,
        0
      ),

    total_marks:
      toNumber(
        row.total_marks ??
        row.max_score,
        0
      ),

    total_questions:
      toNumber(
        row.total_questions,
        questions.length
      ),

    status:
      clean(row.status) ||
      "published",

    result_released:
      Boolean(
        row.result_released
      ),

    fileName,

    file_name:
      fileName,

    filePath,

    file_path:
      filePath,

    fileUrl,

    file_url:
      fileUrl,

    attachmentName:
      fileName,

    attachment_name:
      fileName,

    attachmentUrl:
      fileUrl,

    attachment_url:
      fileUrl,

    fileType:
      clean(
        row.file_type ??
        row.mime_type
      ),

    file_type:
      clean(
        row.file_type ??
        row.mime_type
      ),

    fileSize:
      toNumber(
        row.file_size,
        0
      ),

    file_size:
      toNumber(
        row.file_size,
        0
      ),

    file:
      filePath ||
      fileUrl ||
      fileName
        ? {
            name: fileName,

            fileName,

            url: fileUrl,

            fileUrl,

            path: filePath,

            filePath,

            type: clean(
              row.file_type ??
              row.mime_type
            ),

            size:
              toNumber(
                row.file_size,
                0
              ),
          }
        : null,

    questions,
  };
};

/* ============================================================
   GET ALL ASSIGNMENTS
============================================================ */

router.get(
  "/",
  async (req, res) => {
    try {
      await ensureFileColumns();

      const tutorReference =
        getTutorReference(req);

      if (
        !isValidTutorReference(
          tutorReference
        )
      ) {
        return res.status(400).json({
          success: false,

          message:
            "A valid SQA tutor reference is required.",
        });
      }

      /*
        This supports both the corrected database value:

          SQA-677281-6D34

        and the old duplicated value:

          SQA-677281-6D34, SQA-677281-6D34
      */

      const result =
        await pool.query(
          `
            SELECT *
            FROM academy_assignments
            WHERE
              UPPER(TRIM(tutor_reference)) = $1

              OR

              UPPER(
                TRIM(
                  SPLIT_PART(
                    tutor_reference,
                    ',',
                    1
                  )
                )
              ) = $1

            ORDER BY
              created_at DESC NULLS LAST,
              id DESC
          `,
          [
            tutorReference.toUpperCase(),
          ]
        );

      const assignments =
        await Promise.all(
          result.rows.map(
            formatAssignment
          )
        );

      return res.json({
        success: true,

        assignments,

        data: assignments,

        results: assignments,

        count:
          assignments.length,
      });
    } catch (error) {
      console.error(
        "GET tutor assignments error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Unable to load assignments.",

        error:
          process.env.NODE_ENV ===
          "development"
            ? error.message
            : undefined,
      });
    }
  }
);

/* ============================================================
   CREATE ASSIGNMENT
============================================================ */

router.post(
  "/",
  upload.single("file"),
  async (req, res) => {
    let client;

    const uploadedFile =
      req.file;

    try {
      await ensureFileColumns();

      /*
        ALWAYS normalize the tutor reference
        before saving it.
      */

      const tutorReference =
        getTutorReference(req);

      if (
        !isValidTutorReference(
          tutorReference
        )
      ) {
        if (uploadedFile) {
          await deleteStoredFile(
            uploadedFile.path
          );
        }

        return res.status(400).json({
          success: false,

          message:
            "A valid SQA tutor reference is required.",
        });
      }

      const tutorName =
        getTutorName(req);

      const title =
        clean(
          req.body.title
        );

      const description =
        clean(
          req.body.description
        );

      const instructions =
        clean(
          req.body.instructions
        );

      const grade =
        clean(
          req.body.grade ??
          req.body.class ??
          req.body.class_name ??
          req.body.className
        );

      const subject =
        clean(
          req.body.subject
        );

      const dueAt =
        clean(
          req.body.dueAt ??
          req.body.due_at ??
          req.body.dueDate ??
          req.body.due_date
        );

      const maxScore =
        toNumber(
          req.body.maxScore ??
          req.body.max_score ??
          req.body.totalMarks ??
          req.body.total_marks,
          0
        );

      const status =
        clean(
          req.body.status
        ) || "published";

      const resultReleased =
        String(
          req.body.resultReleased ??
          req.body.result_released ??
          "false"
        ).toLowerCase() ===
        "true";

      const rawQuestions =
        safeJsonParse(
          req.body.questions,
          []
        );

      const questions =
        normalizeQuestions(
          rawQuestions
        );

      if (!title) {
        if (uploadedFile) {
          await deleteStoredFile(
            uploadedFile.path
          );
        }

        return res.status(400).json({
          success: false,

          message:
            "Assignment title is required.",
        });
      }

      if (!grade) {
        if (uploadedFile) {
          await deleteStoredFile(
            uploadedFile.path
          );
        }

        return res.status(400).json({
          success: false,

          message:
            "Class or grade is required.",
        });
      }

      if (!subject) {
        if (uploadedFile) {
          await deleteStoredFile(
            uploadedFile.path
          );
        }

        return res.status(400).json({
          success: false,

          message:
            "Subject is required.",
        });
      }

      const columns =
        await getTableColumns(
          "academy_assignments"
        );

      const fileData =
        getUploadedFileData(
          uploadedFile
        );

      const insertColumns = [];
      const values = [];
      const placeholders = [];

      const add = (
        column,
        value
      ) => {
        if (!columns.has(column)) {
          return;
        }

        insertColumns.push(
          column
        );

        values.push(
          value
        );

        placeholders.push(
          `$${values.length}`
        );
      };

      /*
        SAVE ONLY THE CLEAN SQA REFERENCE.
      */

      add(
        "tutor_reference",
        tutorReference
      );

      add(
        "tutor_name",
        tutorName
      );

      add(
        "grade",
        grade
      );

      add(
        "class_name",
        grade
      );

      add(
        "subject",
        subject
      );

      add(
        "title",
        title
      );

      add(
        "description",
        description
      );

      add(
        "instructions",
        instructions
      );

      add(
        "due_at",
        dueAt || null
      );

      add(
        "due_date",
        dueAt || null
      );

      add(
        "max_score",
        maxScore
      );

      add(
        "total_marks",
        maxScore
      );

      add(
        "total_questions",
        questions.length
      );

      add(
        "status",
        status
      );

      add(
        "result_released",
        resultReleased
      );

      if (fileData) {
        add(
          "file_name",
          fileData.fileName
        );

        add(
          "file_path",
          fileData.filePath
        );

        add(
          "file_type",
          fileData.fileType
        );

        add(
          "file_size",
          fileData.fileSize
        );
      }

      if (!insertColumns.length) {
        throw new Error(
          "academy_assignments has no usable columns."
        );
      }

      client =
        await pool.connect();

      await client.query(
        "BEGIN"
      );

      const insertResult =
        await client.query(
          `
            INSERT INTO academy_assignments
            (
              ${insertColumns
                .map(quoteIdentifier)
                .join(", ")}
            )
            VALUES
            (
              ${placeholders.join(", ")}
            )
            RETURNING *
          `,
          values
        );

      let assignment =
        insertResult.rows[0];

      const assignmentId =
        assignment.id;

      if (
        fileData &&
        columns.has("file_url")
      ) {
        const fileUrl =
          getFileUrl(
            assignmentId
          );

        const updateColumns = [
          `"file_url" = $1`,
        ];

        const updateValues = [
          fileUrl,
        ];

        if (
          columns.has(
            "updated_at"
          )
        ) {
          updateColumns.push(
            `"updated_at" = CURRENT_TIMESTAMP`
          );
        }

        updateValues.push(
          assignmentId
        );

        await client.query(
          `
            UPDATE academy_assignments
            SET ${updateColumns.join(", ")}
            WHERE id = $2
          `,
          updateValues
        );

        assignment = {
          ...assignment,

          file_url:
            fileUrl,
        };
      }

      await insertQuestions(
        client,
        assignmentId,
        questions
      );

      await client.query(
        "COMMIT"
      );

      const finalResult =
        await pool.query(
          `
            SELECT *
            FROM academy_assignments
            WHERE id = $1
            LIMIT 1
          `,
          [assignmentId]
        );

      const formatted =
        await formatAssignment(
          finalResult.rows[0]
        );

      return res.status(201).json({
        success: true,

        message:
          "Assignment created successfully.",

        assignment:
          formatted,

        data:
          formatted,
      });
    } catch (error) {
      if (client) {
        try {
          await client.query(
            "ROLLBACK"
          );
        } catch {}
      }

      if (uploadedFile) {
        await deleteStoredFile(
          uploadedFile.path
        );
      }

      console.error(
        "POST tutor assignment error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Unable to create assignment.",

        error:
          process.env.NODE_ENV ===
          "development"
            ? error.message
            : undefined,
      });
    } finally {
      if (client) {
        client.release();
      }
    }
  }
);

/* ============================================================
   GET ASSIGNMENT FILE
============================================================ */

router.get(
  "/:id/file",
  async (req, res) => {
    try {
      await ensureFileColumns();

      const id =
        clean(
          req.params.id
        );

      const tutorReference =
        getTutorReference(req);

      const result =
        await pool.query(
          `
            SELECT
              id,
              tutor_reference,
              file_path,
              file_name,
              file_type
            FROM academy_assignments
            WHERE id = $1
            LIMIT 1
          `,
          [id]
        );

      if (!result.rows.length) {
        return res.status(404).json({
          success: false,

          message:
            "Assignment not found.",
        });
      }

      const assignment =
        result.rows[0];

      /*
        If a tutor reference was supplied,
        verify it using the normalized SQA reference.
      */

      if (tutorReference) {
        const storedTutorReference =
          normalizeTutorReference(
            assignment.tutor_reference
          );

        if (
          storedTutorReference !==
          tutorReference
        ) {
          return res.status(403).json({
            success: false,

            message:
              "You are not authorized to access this file.",
          });
        }
      }

      const storedPath =
        normalizeStoredFilePath(
          assignment.file_path
        );

      if (!storedPath) {
        return res.status(404).json({
          success: false,

          message:
            "No file is attached to this assignment.",
        });
      }

      const fileName =
        path.basename(
          storedPath
        );

      const absolutePath =
        path.join(
          UPLOAD_DIR,
          fileName
        );

      if (
        !fs.existsSync(
          absolutePath
        )
      ) {
        return res.status(404).json({
          success: false,

          message:
            "The uploaded file could not be found on the server.",
        });
      }

      const mimeType =
        clean(
          assignment.file_type
        ) ||
        "application/octet-stream";

      res.setHeader(
        "Content-Type",
        mimeType
      );

      res.setHeader(
        "Content-Disposition",
        `inline; filename="${String(
          assignment.file_name ||
          fileName
        ).replace(/"/g, "")}"`
      );

      return res.sendFile(
        absolutePath
      );
    } catch (error) {
      console.error(
        "GET assignment file error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Unable to open assignment file.",
      });
    }
  }
);

/* ============================================================
   GET SINGLE ASSIGNMENT
============================================================ */

router.get(
  "/:id",
  async (req, res) => {
    try {
      await ensureFileColumns();

      const id =
        clean(
          req.params.id
        );

      const tutorReference =
        getTutorReference(req);

      if (
        !isValidTutorReference(
          tutorReference
        )
      ) {
        return res.status(400).json({
          success: false,

          message:
            "A valid SQA tutor reference is required.",
        });
      }

      const result =
        await pool.query(
          `
            SELECT *
            FROM academy_assignments
            WHERE id = $1
              AND (
                UPPER(TRIM(tutor_reference)) = $2

                OR

                UPPER(
                  TRIM(
                    SPLIT_PART(
                      tutor_reference,
                      ',',
                      1
                    )
                  )
                ) = $2
              )
            LIMIT 1
          `,
          [
            id,
            tutorReference.toUpperCase(),
          ]
        );

      if (!result.rows.length) {
        return res.status(404).json({
          success: false,

          message:
            "Assignment not found.",
        });
      }

      const assignment =
        await formatAssignment(
          result.rows[0]
        );

      return res.json({
        success: true,

        assignment,

        data:
          assignment,
      });
    } catch (error) {
      console.error(
        "GET single assignment error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Unable to load assignment.",

        error:
          process.env.NODE_ENV ===
          "development"
            ? error.message
            : undefined,
      });
    }
  }
);

/* ============================================================
   PATCH ASSIGNMENT
============================================================ */

router.patch(
  "/:id",
  upload.single("file"),
  async (req, res) => {
    const uploadedFile =
      req.file;

    let client;

    try {
      await ensureFileColumns();

      const id =
        clean(
          req.params.id
        );

      const tutorReference =
        getTutorReference(req);

      if (
        !isValidTutorReference(
          tutorReference
        )
      ) {
        if (uploadedFile) {
          await deleteStoredFile(
            uploadedFile.path
          );
        }

        return res.status(400).json({
          success: false,

          message:
            "A valid SQA tutor reference is required.",
        });
      }

      /*
        Find assignment using the normalized
        tutor reference.
      */

      const existingResult =
        await pool.query(
          `
            SELECT *
            FROM academy_assignments
            WHERE id = $1
              AND (
                UPPER(TRIM(tutor_reference)) = $2

                OR

                UPPER(
                  TRIM(
                    SPLIT_PART(
                      tutor_reference,
                      ',',
                      1
                    )
                  )
                ) = $2
              )
            LIMIT 1
          `,
          [
            id,
            tutorReference.toUpperCase(),
          ]
        );

      if (
        !existingResult.rows.length
      ) {
        if (uploadedFile) {
          await deleteStoredFile(
            uploadedFile.path
          );
        }

        return res.status(404).json({
          success: false,

          message:
            "Assignment not found.",
        });
      }

      const existing =
        existingResult.rows[0];

      const columns =
        await getTableColumns(
          "academy_assignments"
        );

      const updates = [];
      const values = [];

      const addUpdate = (
        column,
        value
      ) => {
        if (
          !columns.has(column)
        ) {
          return;
        }

        updates.push(
          `${quoteIdentifier(
            column
          )} = $${values.length + 1}`
        );

        values.push(
          value
        );
      };

      /* ========================================================
         TITLE
      ======================================================== */

      if (
        req.body.title !==
        undefined
      ) {
        addUpdate(
          "title",
          clean(
            req.body.title
          )
        );
      }

      /* ========================================================
         DESCRIPTION
      ======================================================== */

      if (
        req.body.description !==
        undefined
      ) {
        addUpdate(
          "description",
          clean(
            req.body.description
          )
        );
      }

      /* ========================================================
         INSTRUCTIONS
      ======================================================== */

      if (
        req.body.instructions !==
        undefined
      ) {
        addUpdate(
          "instructions",
          clean(
            req.body.instructions
          )
        );
      }

      /* ========================================================
         GRADE / CLASS
      ======================================================== */

      if (
        req.body.grade !==
          undefined ||
        req.body.class !==
          undefined ||
        req.body.class_name !==
          undefined ||
        req.body.className !==
          undefined
      ) {
        const grade =
          clean(
            req.body.grade ??
            req.body.class ??
            req.body.class_name ??
            req.body.className
          );

        addUpdate(
          "grade",
          grade
        );

        addUpdate(
          "class_name",
          grade
        );
      }

      /* ========================================================
         SUBJECT
      ======================================================== */

      if (
        req.body.subject !==
        undefined
      ) {
        addUpdate(
          "subject",
          clean(
            req.body.subject
          )
        );
      }

      /* ========================================================
         DUE DATE
      ======================================================== */

      if (
        req.body.dueDate !==
          undefined ||
        req.body.due_date !==
          undefined ||
        req.body.dueAt !==
          undefined ||
        req.body.due_at !==
          undefined
      ) {
        const dueAt =
          clean(
            req.body.dueDate ??
            req.body.due_date ??
            req.body.dueAt ??
            req.body.due_at
          );

        addUpdate(
          "due_at",
          dueAt || null
        );

        addUpdate(
          "due_date",
          dueAt || null
        );
      }

      /* ========================================================
         MAX SCORE
      ======================================================== */

      if (
        req.body.maxScore !==
          undefined ||
        req.body.max_score !==
          undefined ||
        req.body.totalMarks !==
          undefined ||
        req.body.total_marks !==
          undefined
      ) {
        const maxScore =
          toNumber(
            req.body.maxScore ??
            req.body.max_score ??
            req.body.totalMarks ??
            req.body.total_marks,
            0
          );

        addUpdate(
          "max_score",
          maxScore
        );

        addUpdate(
          "total_marks",
          maxScore
        );
      }

      /* ========================================================
         STATUS
      ======================================================== */

      if (
        req.body.status !==
        undefined
      ) {
        addUpdate(
          "status",
          clean(
            req.body.status
          )
        );
      }

      /* ========================================================
         RESULT RELEASED
      ======================================================== */

      if (
        req.body.resultReleased !==
          undefined ||
        req.body.result_released !==
          undefined
      ) {
        const released =
          String(
            req.body.resultReleased ??
            req.body.result_released
          ).toLowerCase() ===
          "true";

        addUpdate(
          "result_released",
          released
        );
      }

      /* ========================================================
         QUESTIONS
      ======================================================== */

      const rawQuestions =
        safeJsonParse(
          req.body.questions,
          null
        );

      const questionsProvided =
        Array.isArray(
          rawQuestions
        );

      const questions =
        questionsProvided
          ? normalizeQuestions(
              rawQuestions
            )
          : null;

      if (
        questionsProvided &&
        columns.has(
          "total_questions"
        )
      ) {
        addUpdate(
          "total_questions",
          questions.length
        );
      }

      /* ========================================================
         NEW FILE
      ======================================================== */

      let oldFilePath = "";

      if (uploadedFile) {
        oldFilePath =
          clean(
            existing.file_path
          );

        const fileData =
          getUploadedFileData(
            uploadedFile
          );

        addUpdate(
          "file_name",
          fileData.fileName
        );

        addUpdate(
          "file_path",
          fileData.filePath
        );

        addUpdate(
          "file_type",
          fileData.fileType
        );

        addUpdate(
          "file_size",
          fileData.fileSize
        );

        addUpdate(
          "file_url",
          getFileUrl(id)
        );
      }

      /* ========================================================
         UPDATED AT
      ======================================================== */

      if (
        columns.has(
          "updated_at"
        )
      ) {
        updates.push(
          `"updated_at" = CURRENT_TIMESTAMP`
        );
      }

      if (!updates.length) {
        if (uploadedFile) {
          await deleteStoredFile(
            uploadedFile.path
          );
        }

        const formatted =
          await formatAssignment(
            existing
          );

        return res.json({
          success: true,

          message:
            "No changes were made.",

          assignment:
            formatted,

          data:
            formatted,
        });
      }

      client =
        await pool.connect();

      await client.query(
        "BEGIN"
      );

      /*
        IMPORTANT FIX:

        The old code used the same placeholder
        for both id and tutor_reference.

        We now use two separate placeholders.
      */

      const idPlaceholder =
        values.length + 1;

      values.push(id);

      const tutorReferencePlaceholder =
        values.length + 1;

      values.push(
        tutorReference
      );

      const updateResult =
        await client.query(
          `
            UPDATE academy_assignments

            SET ${updates.join(", ")}

            WHERE id = $${idPlaceholder}

              AND (
                UPPER(
                  TRIM(tutor_reference)
                ) = $${tutorReferencePlaceholder}

                OR

                UPPER(
                  TRIM(
                    SPLIT_PART(
                      tutor_reference,
                      ',',
                      1
                    )
                  )
                ) = $${tutorReferencePlaceholder}
              )

            RETURNING *
          `,
          values
        );

      if (
        !updateResult.rows.length
      ) {
        await client.query(
          "ROLLBACK"
        );

        if (uploadedFile) {
          await deleteStoredFile(
            uploadedFile.path
          );
        }

        return res.status(403).json({
          success: false,

          message:
            "You are not authorized to update this assignment.",
        });
      }

      /* ========================================================
         UPDATE QUESTIONS
      ======================================================== */

      if (
        questionsProvided
      ) {
        const questionColumns =
          await getTableColumns(
            "academy_assignment_questions"
          );

        if (
          questionColumns.has(
            "assignment_id"
          )
        ) {
          await client.query(
            `
              DELETE FROM academy_assignment_questions
              WHERE assignment_id = $1
            `,
            [id]
          );

          await insertQuestions(
            client,
            id,
            questions
          );
        }
      }

      await client.query(
        "COMMIT"
      );

      /* ========================================================
         DELETE OLD FILE
      ======================================================== */

      if (
        uploadedFile &&
        oldFilePath
      ) {
        await deleteStoredFile(
          oldFilePath
        );
      }

      const finalResult =
        await pool.query(
          `
            SELECT *
            FROM academy_assignments
            WHERE id = $1
            LIMIT 1
          `,
          [id]
        );

      const formatted =
        await formatAssignment(
          finalResult.rows[0]
        );

      return res.json({
        success: true,

        message:
          "Assignment updated successfully.",

        assignment:
          formatted,

        data:
          formatted,
      });
    } catch (error) {
      if (client) {
        try {
          await client.query(
            "ROLLBACK"
          );
        } catch {}
      }

      if (uploadedFile) {
        await deleteStoredFile(
          uploadedFile.path
        );
      }

      console.error(
        "PATCH tutor assignment error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Unable to update assignment.",

        error:
          process.env.NODE_ENV ===
          "development"
            ? error.message
            : undefined,
      });
    } finally {
      if (client) {
        client.release();
      }
    }
  }
);

/* ============================================================
   DELETE ASSIGNMENT
============================================================ */

router.delete(
  "/:id",
  async (req, res) => {
    let client;

    try {
      const id =
        clean(
          req.params.id
        );

      const tutorReference =
        getTutorReference(req);

      if (
        !isValidTutorReference(
          tutorReference
        )
      ) {
        return res.status(400).json({
          success: false,

          message:
            "A valid SQA tutor reference is required.",
        });
      }

      const existingResult =
        await pool.query(
          `
            SELECT *
            FROM academy_assignments
            WHERE id = $1
              AND (
                UPPER(TRIM(tutor_reference)) = $2

                OR

                UPPER(
                  TRIM(
                    SPLIT_PART(
                      tutor_reference,
                      ',',
                      1
                    )
                  )
                ) = $2
              )
            LIMIT 1
          `,
          [
            id,
            tutorReference.toUpperCase(),
          ]
        );

      if (
        !existingResult.rows.length
      ) {
        return res.status(404).json({
          success: false,

          message:
            "Assignment not found.",
        });
      }

      const assignment =
        existingResult.rows[0];

      client =
        await pool.connect();

      await client.query(
        "BEGIN"
      );

      /* ========================================================
         DELETE ANSWERS
      ======================================================== */

      const answerColumns =
        await getTableColumns(
          "academy_assignment_answers"
        );

      const submissionColumns =
        await getTableColumns(
          "academy_assignment_submissions"
        );

      const questionColumns =
        await getTableColumns(
          "academy_assignment_questions"
        );

      /*
        Delete answers through submissions first
        when submission_id exists.
      */

      if (
        answerColumns.has(
          "submission_id"
        ) &&
        submissionColumns.has(
          "assignment_id"
        )
      ) {
        const submissions =
          await client.query(
            `
              SELECT id
              FROM academy_assignment_submissions
              WHERE assignment_id = $1
            `,
            [id]
          );

        if (
          submissions.rows.length
        ) {
          const submissionIds =
            submissions.rows.map(
              (row) => row.id
            );

          await client.query(
            `
              DELETE FROM academy_assignment_answers
              WHERE submission_id = ANY($1::bigint[])
            `,
            [submissionIds]
          );
        }
      }

      /* ========================================================
         DELETE SUBMISSIONS
      ======================================================== */

      if (
        submissionColumns.has(
          "assignment_id"
        )
      ) {
        await client.query(
          `
            DELETE FROM academy_assignment_submissions
            WHERE assignment_id = $1
          `,
          [id]
        );
      }

      /* ========================================================
         DELETE QUESTIONS
      ======================================================== */

      if (
        questionColumns.has(
          "assignment_id"
        )
      ) {
        await client.query(
          `
            DELETE FROM academy_assignment_questions
            WHERE assignment_id = $1
          `,
          [id]
        );
      }

      /* ========================================================
         DELETE ASSIGNMENT
      ======================================================== */

      await client.query(
        `
          DELETE FROM academy_assignments
          WHERE id = $1
            AND (
              UPPER(TRIM(tutor_reference)) = $2

              OR

              UPPER(
                TRIM(
                  SPLIT_PART(
                    tutor_reference,
                    ',',
                    1
                  )
                )
              ) = $2
            )
        `,
        [
          id,
          tutorReference.toUpperCase(),
        ]
      );

      await client.query(
        "COMMIT"
      );

      await deleteStoredFile(
        assignment.file_path
      );

      return res.json({
        success: true,

        message:
          "Assignment deleted successfully.",
      });
    } catch (error) {
      if (client) {
        try {
          await client.query(
            "ROLLBACK"
          );
        } catch {}
      }

      console.error(
        "DELETE tutor assignment error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Unable to delete assignment.",

        error:
          process.env.NODE_ENV ===
          "development"
            ? error.message
            : undefined,
      });
    } finally {
      if (client) {
        client.release();
      }
    }
  }
);

/* ============================================================
   MULTER ERROR HANDLER
============================================================ */

router.use(
  (
    error,
    _req,
    res,
    _next
  ) => {
    if (
      error instanceof
      multer.MulterError
    ) {
      if (
        error.code ===
        "LIMIT_FILE_SIZE"
      ) {
        return res.status(400).json({
          success: false,

          message:
            "The uploaded file is too large. Maximum size is 250 MB.",
        });
      }

      return res.status(400).json({
        success: false,

        message:
          error.message ||
          "Unable to upload file.",
      });
    }

    if (error) {
      console.error(
        "Tutor assignments upload error:",
        error
      );

      return res.status(400).json({
        success: false,

        message:
          error.message ||
          "Unable to upload file.",
      });
    }

    return res.status(500).json({
      success: false,

      message:
        "Unexpected server error.",
    });
  }
);

export default router;