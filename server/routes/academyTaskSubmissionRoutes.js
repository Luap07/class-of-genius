import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";

import pool from "../lib/db.js";

const router = express.Router();

/* =========================================================
   CONFIG
========================================================= */

const MAX_FILE_SIZE = 250 * 1024 * 1024;
const MAX_FILES = 10;

const UPLOAD_DIR = path.resolve(
  process.cwd(),
  "uploads",
  "task-submissions"
);

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "image/avif",

  "video/mp4",
  "video/webm",
  "video/quicktime",
]);

/* =========================================================
   BASIC HELPERS
========================================================= */

const clean = (value) =>
  value === undefined || value === null
    ? ""
    : String(value).trim();

const normalize = (value) =>
  clean(value)
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const normalizeStatus = (value) =>
  clean(value)
    .toLowerCase()
    .replace(/[\s_-]+/g, "");

const toNumber = (value) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return null;
  }

  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : null;
};

const toIso = (value) => {
  if (!value) return null;

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? null
    : date.toISOString();
};

const parseJson = (value, fallback = {}) => {
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

const arrayValue = (value) => {
  if (Array.isArray(value)) {
    return value;
  }

  if (!value) {
    return [];
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);

      if (Array.isArray(parsed)) {
        return parsed;
      }

      if (parsed && typeof parsed === "object") {
        return [parsed];
      }
    } catch {}

    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [value];
};

/* =========================================================
   DATABASE HELPERS
========================================================= */

async function tableExists(tableName) {
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
}

async function getColumns(tableName) {
  if (!(await tableExists(tableName))) {
    return [];
  }

  const result = await pool.query(
    `
      SELECT
        column_name,
        data_type
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = $1
      ORDER BY ordinal_position
    `,
    [tableName]
  );

  return result.rows;
}

const columnSet = (columns) =>
  new Set(columns.map((column) => column.column_name));

const firstColumn = (names, columns) =>
  names.find((name) => columns.has(name));

/* =========================================================
   UPLOADS
========================================================= */

function ensureUploadDirectory() {
  fs.mkdirSync(UPLOAD_DIR, {
    recursive: true,
  });
}

ensureUploadDirectory();

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    ensureUploadDirectory();
    callback(null, UPLOAD_DIR);
  },

  filename: (_req, file, callback) => {
    const extension = path
      .extname(file.originalname || "")
      .replace(/[^a-zA-Z0-9.]/g, "")
      .toLowerCase();

    callback(
      null,
      `${Date.now()}-${crypto
        .randomBytes(12)
        .toString("hex")}${extension}`
    );
  },
});

const upload = multer({
  storage,

  limits: {
    fileSize: MAX_FILE_SIZE,
    files: MAX_FILES,
  },

  fileFilter: (_req, file, callback) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      return callback(
        new Error(
          `File type is not allowed: ${file.mimetype}`
        )
      );
    }

    callback(null, true);
  },
});

function deleteUploadedFiles(files = []) {
  for (const file of files) {
    try {
      if (
        file?.path &&
        fs.existsSync(file.path)
      ) {
        fs.unlinkSync(file.path);
      }
    } catch (error) {
      console.error(
        "Unable to delete uploaded file:",
        error
      );
    }
  }
}

/* =========================================================
   ATTACHMENTS
========================================================= */

function attachmentType(mime) {
  const type = clean(mime).toLowerCase();

  if (type === "application/pdf") {
    return "pdf";
  }

  if (
    type === "application/msword" ||
    type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return "document";
  }

  if (type.startsWith("image/")) {
    return "image";
  }

  if (type.startsWith("video/")) {
    return "video";
  }

  return "file";
}

function buildAttachments(files = []) {
  return files.map((file) => ({
    id: crypto.randomUUID(),

    originalName: file.originalname,
    original_name: file.originalname,

    filename: file.filename,

    mimeType: file.mimetype,
    mime_type: file.mimetype,

    size: file.size,
    fileSize: file.size,
    file_size: file.size,

    type: attachmentType(file.mimetype),

    url: `/uploads/task-submissions/${encodeURIComponent(
      file.filename
    )}`,

    createdAt: new Date().toISOString(),
    created_at: new Date().toISOString(),
  }));
}

function normalizeAttachment(value) {
  if (!value) return null;

  if (typeof value === "string") {
    return {
      id: value,
      originalName: path.basename(value),
      original_name: path.basename(value),
      filename: path.basename(value),
      mimeType: "",
      mime_type: "",
      size: null,
      fileSize: null,
      file_size: null,
      type: "file",
      url: value,
    };
  }

  const filename = clean(
    value.filename ||
      value.fileName ||
      value.file_name
  );

  const originalName = clean(
    value.originalName ||
      value.original_name ||
      value.name ||
      filename
  );

  const mimeType = clean(
    value.mimeType ||
      value.mime_type
  );

  let url = clean(
    value.url ||
      value.path ||
      value.fileUrl ||
      value.file_url
  );

  if (!url && filename) {
    url =
      `/uploads/task-submissions/${encodeURIComponent(
        filename
      )}`;
  }

  return {
    ...value,

    id:
      value.id ||
      crypto.randomUUID(),

    originalName,
    original_name: originalName,

    filename,

    mimeType,
    mime_type: mimeType,

    size:
      value.size ??
      value.fileSize ??
      value.file_size ??
      null,

    fileSize:
      value.fileSize ??
      value.size ??
      value.file_size ??
      null,

    file_size:
      value.file_size ??
      value.fileSize ??
      value.size ??
      null,

    type:
      clean(value.type) ||
      attachmentType(mimeType),

    url,
  };
}

function normalizeAttachments(value) {
  return arrayValue(value)
    .map(normalizeAttachment)
    .filter(Boolean);
}

/* =========================================================
   TUTOR
========================================================= */

function getTutorReference(tutor) {
  return clean(
    tutor?.reference ||
      tutor?.application_reference ||
      tutor?.applicationReference ||
      tutor?.tutor_reference ||
      tutor?.tutorReference
  );
}

function getTutorName(tutor) {
  const direct = clean(
    tutor?.full_name ||
      tutor?.fullName ||
      tutor?.name
  );

  if (direct) return direct;

  return [
    tutor?.first_name ||
      tutor?.firstName,

    tutor?.middle_name ||
      tutor?.middleName,

    tutor?.last_name ||
      tutor?.lastName,
  ]
    .map(clean)
    .filter(Boolean)
    .join(" ");
}

async function findTutor(reference) {
  const tutorReference = clean(reference);

  if (!tutorReference) {
    return null;
  }

  if (
    !(await tableExists(
      "academy_tutor_applications"
    ))
  ) {
    return null;
  }

  const result = await pool.query(
    `
      SELECT *
      FROM academy_tutor_applications
      ORDER BY created_at DESC NULLS LAST
    `
  );

  const target = normalize(
    tutorReference
  );

  return (
    result.rows.find(
      (row) =>
        normalize(
          getTutorReference(row)
        ) === target
    ) || null
  );
}

async function verifyTutor(reference) {
  const tutor =
    await findTutor(reference);

  if (!tutor) {
    return {
      tutor: null,
      error: {
        status: 404,
        code: "TUTOR_NOT_FOUND",
        message:
          "Tutor account could not be found.",
      },
    };
  }

  const status = normalizeStatus(
    tutor.application_status ||
      tutor.status
  );

  if (
    status !== "verified" &&
    status !== "approved"
  ) {
    return {
      tutor: null,
      error: {
        status: 403,
        code: "TUTOR_NOT_VERIFIED",
        message:
          "Your tutor account has not been verified yet.",
      },
    };
  }

  return {
    tutor,
    error: null,
  };
}

function getRequestTutorReference(req) {
  return clean(
    req.query?.reference ||
      req.query?.tutorReference ||
      req.query?.tutor_reference ||
      req.query?.assignmentReference ||
      req.query?.assignment_reference ||
      req.headers["x-tutor-reference"]
  );
}

/* =========================================================
   TASK HELPERS
========================================================= */

function taskGrade(task) {
  return clean(
    task?.grade ||
      task?.class ||
      task?.class_name ||
      task?.className ||
      task?.level ||
      task?.metadata?.grade ||
      task?.metadata?.class ||
      task?.metadata?.className
  );
}

function taskSubject(task) {
  return clean(
    task?.subject ||
      task?.subject_name ||
      task?.subjectName ||
      task?.metadata?.subject ||
      task?.metadata?.subjectName
  );
}

function taskTutorReference(task) {
  return clean(
    task?.tutor_reference ||
      task?.tutorReference ||
      task?.reference ||
      task?.metadata?.tutorReference ||
      task?.metadata?.tutor_reference ||
      task?.metadata?.reference
  );
}

function taskMetadata(task) {
  return parseJson(
    task?.metadata,
    {}
  );
}

function taskType(task) {
  return clean(
    task?.activity_type ||
      task?.activityType ||
      task?.type ||
      task?.metadata?.activityType ||
      task?.metadata?.activity_type ||
      "task"
  );
}

function isTask(task) {
  const type = normalize(
    taskType(task)
  );

  return [
    "task",
    "tasks",
    "class task",
    "class_task",
  ].includes(type);
}

function taskMaxScore(task) {
  const metadata =
    taskMetadata(task);

  return toNumber(
    task?.max_score ??
      task?.maxScore ??
      metadata?.maxScore ??
      metadata?.max_score
  );
}

function taskDueAt(task) {
  const metadata =
    taskMetadata(task);

  return toIso(
    task?.due_date ??
      task?.dueDate ??
      task?.deadline ??
      task?.due_at ??
      task?.dueAt ??
      metadata?.dueAt ??
      metadata?.due_at ??
      metadata?.deadline ??
      metadata?.dueDate
  );
}

/* =========================================================
   CLASS ACTIVITIES
========================================================= */

function buildActivitySelect(columns) {
  const available =
    columnSet(columns);

  const text = (names, alias) => {
    const column =
      firstColumn(
        names,
        available
      );

    return column
      ? `"${column}"::text AS "${alias}"`
      : `NULL::text AS "${alias}"`;
  };

  const json = (names, alias) => {
    const column =
      firstColumn(
        names,
        available
      );

    if (!column) {
      return `'{}'::jsonb AS "${alias}"`;
    }

    const info =
      columns.find(
        (item) =>
          item.column_name === column
      );

    if (
      info?.data_type === "jsonb"
    ) {
      return `"${column}" AS "${alias}"`;
    }

    if (
      info?.data_type === "json"
    ) {
      return `"${column}"::jsonb AS "${alias}"`;
    }

    return `
      CASE
        WHEN NULLIF(
          TRIM("${column}"::text),
          ''
        ) IS NULL
          THEN '{}'::jsonb
        WHEN LEFT(
          TRIM("${column}"::text),
          1
        ) = '{'
          THEN
            CASE
              WHEN TRIM("${column}"::text)
                ~ '^\\s*\\{.*\\}\\s*$'
              THEN
                "${column}"::text::jsonb
              ELSE
                '{}'::jsonb
            END
        ELSE '{}'::jsonb
      END AS "${alias}"
    `;
  };

  const timestamp = (
    names,
    alias
  ) => {
    const column =
      firstColumn(
        names,
        available
      );

    return column
      ? `"${column}"::timestamptz AS "${alias}"`
      : `NULL::timestamptz AS "${alias}"`;
  };

  const numeric = (
    names,
    alias
  ) => {
    const column =
      firstColumn(
        names,
        available
      );

    if (!column) {
      return `NULL::numeric AS "${alias}"`;
    }

    return `
      CASE
        WHEN NULLIF(
          TRIM("${column}"::text),
          ''
        ) IS NULL
          THEN NULL::numeric

        WHEN TRIM("${column}"::text)
          ~ '^-?[0-9]+(\\.[0-9]+)?$'
          THEN TRIM("${column}"::text)::numeric

        ELSE NULL::numeric
      END AS "${alias}"
    `;
  };

  return [
    available.has("id")
      ? `"id"::text AS "id"`
      : `NULL::text AS "id"`,

    text(
      ["title", "name"],
      "title"
    ),

    text(
      ["description", "details"],
      "description"
    ),

    text(
      [
        "instructions",
        "instruction",
        "task_instructions",
        "taskInstructions",
      ],
      "instructions"
    ),

    text(
      [
        "activity_type",
        "activityType",
        "type",
        "activity",
      ],
      "activity_type"
    ),

    text(
      [
        "grade",
        "class",
        "class_name",
        "className",
        "level",
      ],
      "grade"
    ),

    text(
      [
        "subject",
        "subject_name",
        "subjectName",
      ],
      "subject"
    ),

    text(
      [
        "tutor_reference",
        "tutorReference",
        "reference",
        "tutor_id",
        "tutorId",
      ],
      "tutor_reference"
    ),

    json(
      ["metadata"],
      "metadata"
    ),

    timestamp(
      [
        "due_date",
        "dueDate",
        "deadline",
        "due_at",
        "dueAt",
      ],
      "due_date"
    ),

    numeric(
      [
        "max_score",
        "maxScore",
        "points",
        "total_score",
      ],
      "max_score"
    ),

    timestamp(
      ["created_at"],
      "created_at"
    ),

    timestamp(
      ["updated_at"],
      "updated_at"
    ),
  ].join(",\n");
}

async function findTaskById(taskId) {
  const id = clean(taskId);

  if (!id) return null;

  const columns =
    await getColumns(
      "class_activities"
    );

  if (!columns.length) {
    return null;
  }

  const available =
    columnSet(columns);

  if (!available.has("id")) {
    return null;
  }

  const select =
    buildActivitySelect(
      columns
    );

  const result =
    await pool.query(
      `
        SELECT
          ${select}
        FROM class_activities
        WHERE id::text = $1
        LIMIT 1
      `,
      [id]
    );

  return result.rows[0] || null;
}

/* =========================================================
   SUBMISSION TABLE
========================================================= */

async function ensureSubmissionTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS academy_task_submissions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

      task_id TEXT NOT NULL,

      student_id TEXT,
      student_name TEXT,
      student_email TEXT,

      grade TEXT,
      subject TEXT,

      response_text TEXT,

      attachments JSONB DEFAULT '[]'::jsonb,

      status TEXT NOT NULL DEFAULT 'submitted',

      score NUMERIC,
      max_score NUMERIC,

      feedback TEXT,

      submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

      reviewed_at TIMESTAMPTZ,
      reviewed_by TEXT,

      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const columns = [
    [
      "task_id",
      `ALTER TABLE academy_task_submissions
       ADD COLUMN IF NOT EXISTS task_id TEXT`,
    ],

    [
      "student_id",
      `ALTER TABLE academy_task_submissions
       ADD COLUMN IF NOT EXISTS student_id TEXT`,
    ],

    [
      "student_name",
      `ALTER TABLE academy_task_submissions
       ADD COLUMN IF NOT EXISTS student_name TEXT`,
    ],

    [
      "student_email",
      `ALTER TABLE academy_task_submissions
       ADD COLUMN IF NOT EXISTS student_email TEXT`,
    ],

    [
      "grade",
      `ALTER TABLE academy_task_submissions
       ADD COLUMN IF NOT EXISTS grade TEXT`,
    ],

    [
      "subject",
      `ALTER TABLE academy_task_submissions
       ADD COLUMN IF NOT EXISTS subject TEXT`,
    ],

    [
      "response_text",
      `ALTER TABLE academy_task_submissions
       ADD COLUMN IF NOT EXISTS response_text TEXT`,
    ],

    [
      "attachments",
      `ALTER TABLE academy_task_submissions
       ADD COLUMN IF NOT EXISTS attachments
       JSONB DEFAULT '[]'::jsonb`,
    ],

    [
      "status",
      `ALTER TABLE academy_task_submissions
       ADD COLUMN IF NOT EXISTS status
       TEXT DEFAULT 'submitted'`,
    ],

    [
      "score",
      `ALTER TABLE academy_task_submissions
       ADD COLUMN IF NOT EXISTS score NUMERIC`,
    ],

    [
      "max_score",
      `ALTER TABLE academy_task_submissions
       ADD COLUMN IF NOT EXISTS max_score NUMERIC`,
    ],

    [
      "feedback",
      `ALTER TABLE academy_task_submissions
       ADD COLUMN IF NOT EXISTS feedback TEXT`,
    ],

    [
      "submitted_at",
      `ALTER TABLE academy_task_submissions
       ADD COLUMN IF NOT EXISTS submitted_at
       TIMESTAMPTZ DEFAULT NOW()`,
    ],

    [
      "reviewed_at",
      `ALTER TABLE academy_task_submissions
       ADD COLUMN IF NOT EXISTS reviewed_at
       TIMESTAMPTZ`,
    ],

    [
      "reviewed_by",
      `ALTER TABLE academy_task_submissions
       ADD COLUMN IF NOT EXISTS reviewed_by TEXT`,
    ],

    [
      "created_at",
      `ALTER TABLE academy_task_submissions
       ADD COLUMN IF NOT EXISTS created_at
       TIMESTAMPTZ DEFAULT NOW()`,
    ],

    [
      "updated_at",
      `ALTER TABLE academy_task_submissions
       ADD COLUMN IF NOT EXISTS updated_at
       TIMESTAMPTZ DEFAULT NOW()`,
    ],
  ];

  for (const [, sql] of columns) {
    await pool.query(sql);
  }
}

/* =========================================================
   NORMALIZE SUBMISSION
========================================================= */

function normalizeSubmission(row, task = null) {
  const metadata = parseJson(
    row?.task_metadata ||
      task?.metadata,
    {}
  );

  const attachments =
    normalizeAttachments(
      row?.attachments
    );

  const submittedAt =
    toIso(
      row?.submitted_at ||
        row?.created_at
    );

  const dueAt =
    toIso(
      row?.task_due_at ||
        taskDueAt(task)
    );

  const score =
    toNumber(row?.score);

  const maxScore =
    toNumber(
      row?.max_score ??
        row?.task_max_score ??
        taskMaxScore(task)
    );

  const status =
    clean(row?.status) ||
    "submitted";

  const statusNormalized =
    normalizeStatus(status);

  const isReviewed =
    statusNormalized === "reviewed" ||
    statusNormalized === "graded";

  const overdue =
    Boolean(
      row?.overdue ||
        row?.is_overdue ||
        row?.isOverdue
    ) ||
    Boolean(
      dueAt &&
        submittedAt &&
        new Date(submittedAt) >
          new Date(dueAt)
    );

  const taskTitle =
    row?.task_title ||
    task?.title ||
    "";

  const taskDescription =
    row?.task_description ||
    task?.description ||
    "";

  const taskInstructions =
    row?.task_instructions ||
    task?.instructions ||
    metadata?.instructions ||
    "";

  const taskGrade =
    row?.task_grade ||
    taskGrade(task);

  const taskSubject =
    row?.task_subject ||
    taskSubject(task);

  return {
    ...row,

    id: row?.id,

    submissionId:
      row?.id ||
      row?.submission_id ||
      null,

    submission_id:
      row?.id ||
      row?.submission_id ||
      null,

    taskId:
      row?.task_id ||
      null,

    task_id:
      row?.task_id ||
      null,

    taskTitle,
    task_title: taskTitle,

    taskDescription,
    task_description: taskDescription,

    taskInstructions,
    task_instructions:
      taskInstructions,

    taskActivityType:
      row?.task_activity_type ||
      taskType(task) ||
      "task",

    task_activity_type:
      row?.task_activity_type ||
      taskType(task) ||
      "task",

    taskGrade,
    task_grade: taskGrade,

    taskSubject,
    task_subject: taskSubject,

    taskMetadata: metadata,

    taskCreatedAt:
      row?.task_created_at ||
      task?.created_at ||
      null,

    taskDueAt: dueAt,
    task_due_at: dueAt,

    dueAt: dueAt,
    due_at: dueAt,
    deadline: dueAt,

    taskMaxScore: maxScore,
    task_max_score: maxScore,

    studentId:
      row?.student_id ||
      null,

    student_id:
      row?.student_id ||
      null,

    studentName:
      row?.student_name ||
      "",

    student_name:
      row?.student_name ||
      "",

    studentEmail:
      row?.student_email ||
      "",

    student_email:
      row?.student_email ||
      "",

    grade:
      row?.grade ||
      taskGrade ||
      "",

    subject:
      row?.subject ||
      taskSubject ||
      "",

    responseText:
      row?.response_text ||
      "",

    response_text:
      row?.response_text ||
      "",

    attachments,

    submissionAttachments:
      attachments,

    submission_attachments:
      attachments,

    submittedFiles:
      attachments,

    submitted_files:
      attachments,

    files:
      attachments,

    status,

    score,

    maxScore,

    max_score: maxScore,

    feedback:
      row?.feedback ||
      "",

    submittedAt,

    submitted_at:
      submittedAt,

    reviewedAt:
      toIso(row?.reviewed_at),

    reviewed_at:
      toIso(row?.reviewed_at),

    reviewedBy:
      row?.reviewed_by ||
      null,

    reviewed_by:
      row?.reviewed_by ||
      null,

    isReviewed,

    isGraded:
      isReviewed ||
      score !== null,

    overdue,

    isOverdue:
      overdue,

    isLate:
      overdue,

    late:
      overdue,

    task: task
      ? {
          ...task,
          title: task.title || "",
          description:
            task.description || "",
          instructions:
            task.instructions || "",
          grade: taskGrade,
          subject: taskSubject,
          dueAt,
          maxScore,
        }
      : null,

    studentSubmission: {
      responseText:
        row?.response_text ||
        "",

      response_text:
        row?.response_text ||
        "",

      attachments,

      files: attachments,

      submittedFiles:
        attachments,

      submittedAt,

      status,
    },
  };
}

/* =========================================================
   STUDENT SUBMIT
========================================================= */

router.post(
  "/student/task-submissions",
  upload.array("files", MAX_FILES),
  async (req, res) => {
    const files = req.files || [];

    try {
      await ensureSubmissionTable();

      const taskId = clean(
        req.body?.taskId ||
          req.body?.task_id
      );

      if (!taskId) {
        deleteUploadedFiles(files);

        return res.status(400).json({
          success: false,
          code: "TASK_ID_REQUIRED",
          message:
            "Task ID is required.",
        });
      }

      const task =
        await findTaskById(taskId);

      if (!task) {
        deleteUploadedFiles(files);

        return res.status(404).json({
          success: false,
          code: "TASK_NOT_FOUND",
          message:
            "The task could not be found.",
        });
      }

      const responseText = clean(
        req.body?.responseText ||
          req.body?.response_text ||
          req.body?.answer
      );

      if (
        !responseText &&
        files.length === 0
      ) {
        deleteUploadedFiles(files);

        return res.status(400).json({
          success: false,
          code: "SUBMISSION_EMPTY",
          message:
            "Please provide an answer or upload at least one file.",
        });
      }

      const studentId = clean(
        req.body?.studentId ||
          req.body?.student_id ||
          req.body?.userId ||
          req.body?.user_id ||
          req.headers["x-student-id"]
      );

      const studentEmail = clean(
        req.body?.email ||
          req.body?.studentEmail ||
          req.body?.student_email ||
          req.headers["x-student-email"]
      ).toLowerCase();

      const studentName = clean(
        req.body?.fullName ||
          req.body?.full_name ||
          req.body?.studentName ||
          req.body?.student_name ||
          req.body?.name
      );

      const attachments =
        buildAttachments(files);

      const existing =
        await pool.query(
          `
            SELECT *
            FROM academy_task_submissions
            WHERE task_id = $1
              AND (
                (
                  $2 <> ''
                  AND student_id = $2
                )
                OR
                (
                  $3 <> ''
                  AND LOWER(student_email)
                    = LOWER($3)
                )
              )
            ORDER BY submitted_at DESC
            LIMIT 1
          `,
          [
            taskId,
            studentId,
            studentEmail,
          ]
        );

      let result;

      if (existing.rows[0]) {
        result =
          await pool.query(
            `
              UPDATE academy_task_submissions
              SET
                student_id = $1,
                student_name = $2,
                student_email = $3,
                grade = $4,
                subject = $5,
                response_text = $6,
                attachments = $7::jsonb,
                status = 'submitted',
                score = NULL,
                max_score = $8,
                feedback = NULL,
                reviewed_at = NULL,
                reviewed_by = NULL,
                submitted_at = NOW(),
                updated_at = NOW()
              WHERE id = $9
              RETURNING *
            `,
            [
              studentId || null,
              studentName || null,
              studentEmail || null,
              taskGrade(task) || null,
              taskSubject(task) || null,
              responseText || null,
              JSON.stringify(attachments),
              taskMaxScore(task),
              existing.rows[0].id,
            ]
          );
      } else {
        result =
          await pool.query(
            `
              INSERT INTO academy_task_submissions (
                task_id,
                student_id,
                student_name,
                student_email,
                grade,
                subject,
                response_text,
                attachments,
                status,
                max_score
              )
              VALUES (
                $1,
                $2,
                $3,
                $4,
                $5,
                $6,
                $7,
                $8::jsonb,
                'submitted',
                $9
              )
              RETURNING *
            `,
            [
              taskId,
              studentId || null,
              studentName || null,
              studentEmail || null,
              taskGrade(task) || null,
              taskSubject(task) || null,
              responseText || null,
              JSON.stringify(attachments),
              taskMaxScore(task),
            ]
          );
      }

      return res.status(
        existing.rows[0]
          ? 200
          : 201
      ).json({
        success: true,

        message:
          existing.rows[0]
            ? "Task resubmitted successfully."
            : "Task submitted successfully.",

        submission:
          normalizeSubmission(
            result.rows[0],
            task
          ),
      });
    } catch (error) {
      deleteUploadedFiles(files);

      console.error(
        "Student task submission error:",
        error
      );

      return res.status(500).json({
        success: false,
        code:
          error?.code ||
          "TASK_SUBMISSION_CREATE_ERROR",
        message:
          error?.message ||
          "Unable to submit task.",
        detail:
          error?.detail || null,
      });
    }
  }
);

/* =========================================================
   STUDENT GET SUBMISSIONS
========================================================= */

router.get(
  "/student/task-submissions",
  async (req, res) => {
    try {
      await ensureSubmissionTable();

      const studentId = clean(
        req.query?.studentId ||
          req.query?.student_id ||
          req.query?.userId ||
          req.query?.user_id ||
          req.headers["x-student-id"]
      );

      const email = clean(
        req.query?.email ||
          req.query?.studentEmail ||
          req.query?.student_email ||
          req.headers["x-student-email"]
      ).toLowerCase();

      if (!studentId && !email) {
        return res.status(400).json({
          success: false,
          code:
            "STUDENT_IDENTIFIER_REQUIRED",
          message:
            "Student ID or email is required.",
        });
      }

      const result =
        await pool.query(
          `
            SELECT *
            FROM academy_task_submissions
            WHERE
              (
                $1 <> ''
                AND student_id = $1
              )
              OR
              (
                $2 <> ''
                AND LOWER(student_email)
                  = LOWER($2)
              )
            ORDER BY submitted_at DESC
          `,
          [studentId, email]
        );

      const submissions =
        result.rows.map(
          (row) =>
            normalizeSubmission(row)
        );

      return res.json({
        success: true,
        submissions,
        data: submissions,
        count: submissions.length,
      });
    } catch (error) {
      console.error(
        "Load student submissions error:",
        error
      );

      return res.status(500).json({
        success: false,
        code:
          error?.code ||
          "STUDENT_SUBMISSIONS_LOAD_ERROR",
        message:
          error?.message ||
          "Unable to load submissions.",
      });
    }
  }
);

/* =========================================================
   TUTOR GET SUBMISSIONS
   Supports:

   /tutor/task-submissions

   /tutor/task-submissions?assignmentId=2

   /tutor/task-submissions?taskId=2
========================================================= */

router.get(
  "/tutor/task-submissions",
  async (req, res) => {
    try {
      await ensureSubmissionTable();

      const reference =
        getRequestTutorReference(req);

      if (!reference) {
        return res.status(400).json({
          success: false,
          code:
            "TUTOR_REFERENCE_REQUIRED",
          message:
            "Tutor reference is required.",
        });
      }

      const tutorCheck =
        await verifyTutor(reference);

      if (tutorCheck.error) {
        return res
          .status(
            tutorCheck.error.status
          )
          .json({
            success: false,
            code:
              tutorCheck.error.code,
            message:
              tutorCheck.error.message,
          });
      }

      const tutor =
        tutorCheck.tutor;

      const tutorReference =
        getTutorReference(tutor);

      /* -----------------------------------------------------
         SUPPORT assignmentId FROM FRONTEND
      ----------------------------------------------------- */

      const assignmentId = clean(
        req.query?.assignmentId ||
          req.query?.assignment_id ||
          req.query?.taskId ||
          req.query?.task_id
      );

      const columns =
        await getColumns(
          "class_activities"
        );

      if (!columns.length) {
        return res.json({
          success: true,
          submissions: [],
          data: [],
          count: 0,
          total: 0,
          awaitingReview: 0,
          submittedCount: 0,
          gradedCount: 0,
          reviewedCount: 0,
          overdueCount: 0,
          tutorReference,
          tutorName:
            getTutorName(tutor),
        });
      }

      const available =
        columnSet(columns);

      const directTutorColumn =
        firstColumn(
          [
            "tutor_reference",
            "tutorReference",
            "reference",
            "tutor_id",
            "tutorId",
          ],
          available
        );

      const activitySelect =
        buildActivitySelect(
          columns
        );

      /*
       * IMPORTANT:
       *
       * We use INNER JOIN here.
       *
       * That prevents unrelated/orphaned submissions
       * from appearing in the tutor grading page.
       */
      let sql = `
        SELECT
          s.*,

          a.title AS task_title,

          a.description AS task_description,

          a.instructions AS task_instructions,

          a.activity_type AS task_activity_type,

          a.grade AS task_grade,

          a.subject AS task_subject,

          a.tutor_reference AS task_tutor_reference,

          a.metadata AS task_metadata,

          a.due_date AS task_due_at,

          a.max_score AS task_max_score,

          a.created_at AS task_created_at

        FROM academy_task_submissions s

        INNER JOIN (
          SELECT
            ${activitySelect}
          FROM class_activities
        ) a
          ON a.id::text =
             s.task_id::text

        WHERE 1 = 1
      `;

      const params = [];
      let index = 1;

      /* -----------------------------------------------------
         TUTOR FILTER
      ----------------------------------------------------- */

      if (directTutorColumn) {
        sql += `
          AND LOWER(
            COALESCE(
              a.tutor_reference,
              ''
            )
          ) = LOWER($${index})
        `;
      } else {
        sql += `
          AND LOWER(
            COALESCE(
              a.metadata->>'tutorReference',
              a.metadata->>'tutor_reference',
              a.metadata->>'reference',
              ''
            )
          ) = LOWER($${index})
        `;
      }

      params.push(tutorReference);
      index++;

      /* -----------------------------------------------------
         ASSIGNMENT FILTER
      ----------------------------------------------------- */

      if (assignmentId) {
        sql += `
          AND a.id::text = $${index}
        `;

        params.push(assignmentId);
        index++;
      }

      sql += `
        ORDER BY
          s.submitted_at DESC NULLS LAST,
          s.created_at DESC NULLS LAST
      `;

      const result =
        await pool.query(
          sql,
          params
        );

      const submissions =
        result.rows
          .map((row) =>
            normalizeSubmission(row)
          )
          .filter((submission) =>
            isTask({
              activity_type:
                submission.taskActivityType,

              metadata:
                submission.taskMetadata,
            })
          );

      const awaitingReview =
        submissions.filter(
          (item) =>
            !item.isReviewed
        );

      const graded =
        submissions.filter(
          (item) =>
            item.isGraded
        );

      const overdue =
        submissions.filter(
          (item) =>
            item.overdue
        );

      return res.json({
        success: true,

        submissions,

        data: submissions,

        count:
          submissions.length,

        total:
          submissions.length,

        awaitingReview:
          awaitingReview.length,

        submittedCount:
          awaitingReview.length,

        gradedCount:
          graded.length,

        reviewedCount:
          graded.length,

        overdueCount:
          overdue.length,

        tutorReference,

        tutorName:
          getTutorName(tutor),

        assignmentId:
          assignmentId || null,
      });
    } catch (error) {
      console.error(
        "Load tutor task submissions error:",
        error
      );

      console.error({
        code: error?.code,
        message: error?.message,
        detail: error?.detail,
        hint: error?.hint,
        table: error?.table,
        column: error?.column,
        constraint:
          error?.constraint,
      });

      return res.status(500).json({
        success: false,

        code:
          error?.code ||
          "TUTOR_SUBMISSIONS_LOAD_ERROR",

        message:
          error?.message ||
          "Unable to load task submissions.",

        detail:
          error?.detail || null,

        hint:
          error?.hint || null,

        table:
          error?.table || null,

        column:
          error?.column || null,

        constraint:
          error?.constraint || null,
      });
    }
  }
);

/* =========================================================
   TUTOR GET ONE SUBMISSION
========================================================= */

router.get(
  "/tutor/task-submissions/:submissionId",
  async (req, res) => {
    try {
      await ensureSubmissionTable();

      const reference =
        getRequestTutorReference(req);

      if (!reference) {
        return res.status(400).json({
          success: false,
          code:
            "TUTOR_REFERENCE_REQUIRED",
          message:
            "Tutor reference is required.",
        });
      }

      const tutorCheck =
        await verifyTutor(reference);

      if (tutorCheck.error) {
        return res
          .status(
            tutorCheck.error.status
          )
          .json({
            success: false,
            code:
              tutorCheck.error.code,
            message:
              tutorCheck.error.message,
          });
      }

      const submissionId =
        clean(
          req.params.submissionId
        );

      if (!submissionId) {
        return res.status(400).json({
          success: false,
          code:
            "SUBMISSION_ID_REQUIRED",
          message:
            "Submission ID is required.",
        });
      }

      const result =
        await pool.query(
          `
            SELECT *
            FROM academy_task_submissions
            WHERE id::text = $1
            LIMIT 1
          `,
          [submissionId]
        );

      if (!result.rows.length) {
        return res.status(404).json({
          success: false,
          code:
            "SUBMISSION_NOT_FOUND",
          message:
            "Submission could not be found.",
        });
      }

      const submission =
        result.rows[0];

      const task =
        await findTaskById(
          submission.task_id
        );

      if (!task) {
        return res.status(404).json({
          success: false,
          code: "TASK_NOT_FOUND",
          message:
            "The task connected to this submission could not be found.",
        });
      }

      const tutorReference =
        getTutorReference(
          tutorCheck.tutor
        );

      const owner =
        taskTutorReference(task);

      if (
        owner &&
        normalize(owner) !==
          normalize(tutorReference)
      ) {
        return res.status(403).json({
          success: false,
          code:
            "SUBMISSION_NOT_YOUR_TASK",
          message:
            "This submission does not belong to one of your tasks.",
        });
      }

      const normalized =
        normalizeSubmission(
          submission,
          task
        );

      return res.json({
        success: true,

        submission: normalized,

        task,

        studentSubmission:
          normalized.studentSubmission,
      });
    } catch (error) {
      console.error(
        "Load tutor submission error:",
        error
      );

      return res.status(500).json({
        success: false,
        code:
          error?.code ||
          "TUTOR_SUBMISSION_LOAD_ERROR",
        message:
          error?.message ||
          "Unable to load submission.",
        detail:
          error?.detail || null,
      });
    }
  }
);

/* =========================================================
   TUTOR GRADE / REVIEW
========================================================= */

router.patch(
  "/tutor/task-submissions/:submissionId/review",
  async (req, res) => {
    try {
      await ensureSubmissionTable();

      const reference =
        getRequestTutorReference(req);

      if (!reference) {
        return res.status(400).json({
          success: false,
          code:
            "TUTOR_REFERENCE_REQUIRED",
          message:
            "Tutor reference is required.",
        });
      }

      const tutorCheck =
        await verifyTutor(reference);

      if (tutorCheck.error) {
        return res
          .status(
            tutorCheck.error.status
          )
          .json({
            success: false,
            code:
              tutorCheck.error.code,
            message:
              tutorCheck.error.message,
          });
      }

      const submissionId =
        clean(
          req.params.submissionId
        );

      if (!submissionId) {
        return res.status(400).json({
          success: false,
          code:
            "SUBMISSION_ID_REQUIRED",
          message:
            "Submission ID is required.",
        });
      }

      let score =
        req.body?.score;

      if (
        score !== undefined &&
        score !== null &&
        score !== ""
      ) {
        score = Number(score);

        if (
          !Number.isFinite(score) ||
          score < 0
        ) {
          return res.status(400).json({
            success: false,
            code: "INVALID_SCORE",
            message:
              "Score must be a valid non-negative number.",
          });
        }
      } else {
        score = null;
      }

      let maxScore =
        req.body?.maxScore ??
        req.body?.max_score;

      if (
        maxScore !== undefined &&
        maxScore !== null &&
        maxScore !== ""
      ) {
        maxScore =
          Number(maxScore);

        if (
          !Number.isFinite(maxScore) ||
          maxScore <= 0
        ) {
          return res.status(400).json({
            success: false,
            code:
              "INVALID_MAX_SCORE",
            message:
              "Maximum score must be a valid positive number.",
          });
        }
      } else {
        maxScore = null;
      }

      const feedback = clean(
        req.body?.feedback ||
          req.body?.comment ||
          req.body?.comments
      );

      let status = normalize(
        req.body?.status ||
          "reviewed"
      );

      if (
        ![
          "submitted",
          "reviewed",
          "returned",
        ].includes(status)
      ) {
        status = "reviewed";
      }

      const result =
        await pool.query(
          `
            SELECT *
            FROM academy_task_submissions
            WHERE id::text = $1
            LIMIT 1
          `,
          [submissionId]
        );

      if (!result.rows.length) {
        return res.status(404).json({
          success: false,
          code:
            "SUBMISSION_NOT_FOUND",
          message:
            "Submission could not be found.",
        });
      }

      const submission =
        result.rows[0];

      const task =
        await findTaskById(
          submission.task_id
        );

      if (!task) {
        return res.status(404).json({
          success: false,
          code: "TASK_NOT_FOUND",
          message:
            "The task connected to this submission could not be found.",
        });
      }

      const tutorReference =
        getTutorReference(
          tutorCheck.tutor
        );

      const owner =
        taskTutorReference(task);

      if (
        owner &&
        normalize(owner) !==
          normalize(tutorReference)
      ) {
        return res.status(403).json({
          success: false,
          code:
            "SUBMISSION_NOT_YOUR_TASK",
          message:
            "You cannot review a submission for another tutor's task.",
        });
      }

      if (maxScore === null) {
        maxScore =
          submission.max_score !==
          null
            ? Number(
                submission.max_score
              )
            : taskMaxScore(task);
      }

      if (
        score !== null &&
        maxScore !== null &&
        score > maxScore
      ) {
        return res.status(400).json({
          success: false,
          code:
            "SCORE_EXCEEDS_MAXIMUM",
          message:
            "Score cannot be greater than the maximum score.",
        });
      }

      const updated =
        await pool.query(
          `
            UPDATE academy_task_submissions
            SET
              status = $1,
              score = $2,
              max_score = $3,
              feedback = $4,
              reviewed_at = NOW(),
              reviewed_by = $5,
              updated_at = NOW()
            WHERE id::text = $6
            RETURNING *
          `,
          [
            status,
            score,
            maxScore,
            feedback || null,
            tutorReference,
            submissionId,
          ]
        );

      return res.json({
        success: true,

        message:
          "Task submission reviewed successfully.",

        submission:
          normalizeSubmission(
            updated.rows[0],
            task
          ),
      });
    } catch (error) {
      console.error(
        "Review task submission error:",
        error
      );

      return res.status(500).json({
        success: false,
        code:
          error?.code ||
          "TASK_SUBMISSION_REVIEW_ERROR",
        message:
          error?.message ||
          "Unable to review task submission.",
        detail:
          error?.detail || null,
      });
    }
  }
);

/* =========================================================
   TUTOR GET SUBMISSIONS FOR ONE TASK
========================================================= */

router.get(
  "/tutor/tasks/:taskId/submissions",
  async (req, res) => {
    try {
      await ensureSubmissionTable();

      const reference =
        getRequestTutorReference(req);

      if (!reference) {
        return res.status(400).json({
          success: false,
          code:
            "TUTOR_REFERENCE_REQUIRED",
          message:
            "Tutor reference is required.",
        });
      }

      const tutorCheck =
        await verifyTutor(reference);

      if (tutorCheck.error) {
        return res
          .status(
            tutorCheck.error.status
          )
          .json({
            success: false,
            code:
              tutorCheck.error.code,
            message:
              tutorCheck.error.message,
          });
      }

      const taskId =
        clean(req.params.taskId);

      if (!taskId) {
        return res.status(400).json({
          success: false,
          code:
            "TASK_ID_REQUIRED",
          message:
            "Task ID is required.",
        });
      }

      const task =
        await findTaskById(taskId);

      if (!task) {
        return res.status(404).json({
          success: false,
          code:
            "TASK_NOT_FOUND",
          message:
            "The task could not be found.",
        });
      }

      if (!isTask(task)) {
        return res.status(400).json({
          success: false,
          code:
            "INVALID_TASK",
          message:
            "This activity is not a student task.",
        });
      }

      const tutorReference =
        getTutorReference(
          tutorCheck.tutor
        );

      const owner =
        taskTutorReference(task);

      if (
        owner &&
        normalize(owner) !==
          normalize(tutorReference)
      ) {
        return res.status(403).json({
          success: false,
          code:
            "TASK_NOT_YOUR_TASK",
          message:
            "This task does not belong to you.",
        });
      }

      const result =
        await pool.query(
          `
            SELECT *
            FROM academy_task_submissions
            WHERE task_id::text = $1
            ORDER BY submitted_at DESC
          `,
          [taskId]
        );

      const submissions =
        result.rows.map((row) =>
          normalizeSubmission(
            row,
            task
          )
        );

      return res.json({
        success: true,

        task,

        submissions,

        data: submissions,

        count:
          submissions.length,

        submittedCount:
          submissions.filter(
            (item) =>
              !item.isReviewed
          ).length,

        reviewedCount:
          submissions.filter(
            (item) =>
              item.isReviewed
          ).length,

        gradedCount:
          submissions.filter(
            (item) =>
              item.isGraded
          ).length,

        overdueCount:
          submissions.filter(
            (item) =>
              item.overdue
          ).length,
      });
    } catch (error) {
      console.error(
        "Load task submissions error:",
        error
      );

      return res.status(500).json({
        success: false,
        code:
          error?.code ||
          "TASK_SUBMISSIONS_LOAD_ERROR",
        message:
          error?.message ||
          "Unable to load task submissions.",
        detail:
          error?.detail || null,
      });
    }
  }
);

/* =========================================================
   MULTER / UPLOAD ERRORS
========================================================= */

router.use(
  (error, _req, res, _next) => {
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
          code:
            "FILE_TOO_LARGE",
          message:
            "Each submission file must be 250MB or smaller.",
        });
      }

      if (
        error.code ===
        "LIMIT_FILE_COUNT"
      ) {
        return res.status(400).json({
          success: false,
          code:
            "TOO_MANY_FILES",
          message:
            "You can upload a maximum of 10 files.",
        });
      }

      return res.status(400).json({
        success: false,
        code:
          error.code ||
          "UPLOAD_ERROR",
        message:
          error.message ||
          "Unable to upload submission files.",
      });
    }

    if (error) {
      console.error(
        "Task submission upload error:",
        error
      );

      return res.status(400).json({
        success: false,
        code:
          "SUBMISSION_UPLOAD_ERROR",
        message:
          error.message ||
          "Unable to upload submission files.",
      });
    }

    return res.status(500).json({
      success: false,
      code:
        "TASK_SUBMISSION_ERROR",
      message:
        "Unable to process task submission.",
    });
  }
);

export default router;