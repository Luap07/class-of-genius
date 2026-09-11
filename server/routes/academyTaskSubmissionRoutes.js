import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";

import pool from "../lib/db.js";

const router = express.Router();

/* =========================================================
   CONSTANTS
========================================================= */

const MAX_FILE_SIZE = 250 * 1024 * 1024;
const MAX_FILES = 10;

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

const UPLOAD_DIR = path.resolve(
  process.cwd(),
  "uploads",
  "task-submissions"
);

/* =========================================================
   BASIC HELPERS
========================================================= */

function clean(value) {
  if (value === undefined || value === null) {
    return "";
  }

  return String(value).trim();
}

function normalize(value) {
  return clean(value)
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeStatus(value) {
  return clean(value)
    .toLowerCase()
    .replace(/[\s_-]+/g, "");
}

function arrayFromValue(value) {
  if (Array.isArray(value)) {
    return value;
  }

  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return [];
  }

  if (typeof value === "string") {
    const trimmed = value.trim();

    if (!trimmed) {
      return [];
    }

    try {
      const parsed = JSON.parse(trimmed);

      if (Array.isArray(parsed)) {
        return parsed;
      }

      if (
        parsed &&
        typeof parsed === "object"
      ) {
        return [parsed];
      }
    } catch {}

    return trimmed
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [value];
}

function uniqueArray(values = []) {
  return [
    ...new Set(
      values
        .map((value) => clean(value))
        .filter(Boolean)
    ),
  ];
}

function safeJsonParse(value, fallback = {}) {
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
}

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

async function getTableColumns(tableName) {
  const result = await pool.query(
    `
      SELECT
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = $1
      ORDER BY ordinal_position
    `,
    [tableName]
  );

  return result.rows || [];
}

function columnNames(columns = []) {
  return new Set(
    columns.map(
      (column) => column.column_name
    )
  );
}

function getColumnInfo(
  name,
  columns = []
) {
  return columns.find(
    (column) =>
      column.column_name === name
  );
}

function firstExistingColumn(
  names,
  availableColumns
) {
  return names.find((name) =>
    availableColumns.has(name)
  );
}

/* =========================================================
   STUDENT IDENTIFIERS
========================================================= */

function getStudentId(req) {
  return clean(
    req.body?.studentId ||
      req.body?.student_id ||
      req.body?.userId ||
      req.body?.user_id ||
      req.body?.studentReference ||
      req.body?.student_reference ||
      req.headers["x-student-id"] ||
      req.headers["x-user-id"]
  );
}

function getStudentEmail(req) {
  return clean(
    req.body?.email ||
      req.body?.studentEmail ||
      req.body?.student_email ||
      req.headers["x-student-email"]
  ).toLowerCase();
}

function getStudentName(req) {
  return clean(
    req.body?.fullName ||
      req.body?.full_name ||
      req.body?.studentName ||
      req.body?.student_name ||
      req.body?.name ||
      [
        req.body?.firstName ||
          req.body?.first_name,

        req.body?.middleName ||
          req.body?.middle_name,

        req.body?.lastName ||
          req.body?.last_name,
      ]
        .map(clean)
        .filter(Boolean)
        .join(" ")
  );
}

/* =========================================================
   FILE UPLOAD
========================================================= */

function ensureUploadDirectory() {
  fs.mkdirSync(UPLOAD_DIR, {
    recursive: true,
  });
}

ensureUploadDirectory();

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    try {
      ensureUploadDirectory();
      cb(null, UPLOAD_DIR);
    } catch (error) {
      cb(error);
    }
  },

  filename: (_req, file, cb) => {
    const extension = path.extname(
      file.originalname || ""
    );

    const safeExtension = extension
      .replace(/[^a-zA-Z0-9.]/g, "")
      .toLowerCase();

    const randomPart = crypto
      .randomBytes(16)
      .toString("hex");

    cb(
      null,
      `${Date.now()}-${randomPart}${safeExtension}`
    );
  },
});

const upload = multer({
  storage,

  limits: {
    fileSize: MAX_FILE_SIZE,
    files: MAX_FILES,
  },

  fileFilter: (_req, file, cb) => {
    if (
      !ALLOWED_MIME_TYPES.has(
        file.mimetype
      )
    ) {
      return cb(
        new Error(
          `File type is not allowed: ${file.mimetype}`
        )
      );
    }

    cb(null, true);
  },
});

/* =========================================================
   FILE HELPERS
========================================================= */

function getAttachmentType(mimeType) {
  const mime = clean(
    mimeType
  ).toLowerCase();

  if (mime === "application/pdf") {
    return "pdf";
  }

  if (
    mime === "application/msword" ||
    mime ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return "document";
  }

  if (mime.startsWith("image/")) {
    return "image";
  }

  if (mime.startsWith("video/")) {
    return "video";
  }

  return "file";
}

function buildAttachments(files = []) {
  return files.map((file) => {
    const now =
      new Date().toISOString();

    return {
      id: crypto.randomUUID(),

      originalName:
        file.originalname,

      original_name:
        file.originalname,

      filename:
        file.filename,

      mimeType:
        file.mimetype,

      mime_type:
        file.mimetype,

      size:
        file.size,

      fileSize:
        file.size,

      file_size:
        file.size,

      type:
        getAttachmentType(
          file.mimetype
        ),

      url:
        `/uploads/task-submissions/${file.filename}`,

      createdAt: now,
      created_at: now,
    };
  });
}

function deleteUploadedFiles(
  files = []
) {
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
        "Unable to delete uploaded submission file:",
        error
      );
    }
  }
}

/* =========================================================
   TUTOR HELPERS
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
  return clean(
    tutor?.full_name ||
      tutor?.fullName ||
      tutor?.name ||
      [
        tutor?.first_name ||
          tutor?.firstName,

        tutor?.middle_name ||
          tutor?.middleName,

        tutor?.last_name ||
          tutor?.lastName,
      ]
        .map(clean)
        .filter(Boolean)
        .join(" ")
  );
}

function getTutorClasses(tutor) {
  const possibleValues = [
    tutor?.classes,
    tutor?.class_list,
    tutor?.classList,
    tutor?.grades,
  ];

  for (const value of possibleValues) {
    const values =
      arrayFromValue(value);

    if (values.length) {
      return uniqueArray(
        values.map((item) => {
          if (
            typeof item === "object" &&
            item !== null
          ) {
            return clean(
              item.grade ||
                item.class ||
                item.className ||
                item.class_name ||
                item.level
            );
          }

          return clean(item);
        })
      );
    }
  }

  return [];
}

function getTutorSubjects(tutor) {
  const possibleValues = [
    tutor?.subjects,
    tutor?.subject_list,
    tutor?.subjectList,
  ];

  for (const value of possibleValues) {
    const values =
      arrayFromValue(value);

    if (values.length) {
      return uniqueArray(
        values.map((item) => {
          if (
            typeof item === "object" &&
            item !== null
          ) {
            return clean(
              item.subject ||
                item.name ||
                item.title
            );
          }

          return clean(item);
        })
      );
    }
  }

  return [];
}

async function findTutorByReference(
  reference
) {
  const tutorReference =
    clean(reference);

  if (!tutorReference) {
    return null;
  }

  const exists =
    await tableExists(
      "academy_tutor_applications"
    );

  if (!exists) {
    return null;
  }

  const result =
    await pool.query(
      `
        SELECT *
        FROM academy_tutor_applications
        ORDER BY created_at DESC NULLS LAST
      `
    );

  const target =
    normalize(tutorReference);

  return (
    result.rows.find(
      (row) =>
        normalize(
          getTutorReference(row)
        ) === target
    ) || null
  );
}

async function verifyTutor(
  reference
) {
  const tutor =
    await findTutorByReference(
      reference
    );

  if (!tutor) {
    return {
      tutor: null,

      error: {
        status: 404,

        code:
          "TUTOR_NOT_FOUND",

        message:
          "Tutor account could not be found.",
      },
    };
  }

  const status =
    normalizeStatus(
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

        code:
          "TUTOR_NOT_VERIFIED",

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

/* =========================================================
   STUDENT ENROLLMENT HELPERS
========================================================= */

function getEnrollmentStudentId(
  row
) {
  return clean(
    row?.student_id ||
      row?.studentId ||
      row?.user_id ||
      row?.userId ||
      row?.student_reference ||
      row?.studentReference
  );
}

function getEnrollmentEmail(row) {
  return clean(
    row?.email ||
      row?.student_email ||
      row?.studentEmail
  ).toLowerCase();
}

function getEnrollmentName(row) {
  const direct = clean(
    row?.full_name ||
      row?.fullName ||
      row?.student_name ||
      row?.studentName ||
      row?.name
  );

  if (direct) {
    return direct;
  }

  return [
    row?.first_name ||
      row?.firstName,

    row?.middle_name ||
      row?.middleName,

    row?.last_name ||
      row?.lastName,
  ]
    .map(clean)
    .filter(Boolean)
    .join(" ");
}

function getEnrollmentClass(row) {
  return clean(
    row?.grade ||
      row?.class ||
      row?.class_name ||
      row?.className ||
      row?.level
  );
}

function getEnrollmentSubjects(row) {
  return uniqueArray(
    arrayFromValue(
      row?.subjects ||
        row?.subject ||
        row?.selected_subjects ||
        row?.selectedSubjects
    ).map((item) => {
      if (
        typeof item === "object" &&
        item !== null
      ) {
        return clean(
          item.subject ||
            item.name ||
            item.title
        );
      }

      return clean(item);
    })
  );
}

async function findStudentEnrollment(
  req
) {
  const studentId =
    getStudentId(req);

  const studentEmail =
    getStudentEmail(req);

  const studentName =
    getStudentName(req);

  const exists =
    await tableExists(
      "academy_student_enrollments"
    );

  if (!exists) {
    return null;
  }

  const result =
    await pool.query(
      `
        SELECT *
        FROM academy_student_enrollments
        ORDER BY created_at DESC NULLS LAST
      `
    );

  const rows =
    result.rows || [];

  if (!rows.length) {
    return null;
  }

  if (studentId) {
    const match =
      rows.find(
        (row) =>
          normalize(
            getEnrollmentStudentId(
              row
            )
          ) ===
          normalize(studentId)
      );

    if (match) {
      return match;
    }
  }

  if (studentEmail) {
    const match =
      rows.find(
        (row) =>
          normalize(
            getEnrollmentEmail(row)
          ) ===
          normalize(studentEmail)
      );

    if (match) {
      return match;
    }
  }

  if (studentName) {
    const match =
      rows.find(
        (row) =>
          normalize(
            getEnrollmentName(row)
          ) ===
          normalize(studentName)
      );

    if (match) {
      return match;
    }
  }

  return null;
}

/* =========================================================
   CLASS ACTIVITY HELPERS
========================================================= */

async function getClassActivityColumns() {
  const exists =
    await tableExists(
      "class_activities"
    );

  if (!exists) {
    return [];
  }

  return getTableColumns(
    "class_activities"
  );
}

function getTaskId(req) {
  return clean(
    req.body?.taskId ||
      req.body?.task_id ||
      req.body?.activityId ||
      req.body?.activity_id ||
      req.params?.taskId ||
      req.params?.activityId ||
      req.query?.taskId ||
      req.query?.task_id ||
      req.query?.activityId ||
      req.query?.activity_id
  );
}

function getTaskGrade(task) {
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

function getTaskSubject(task) {
  return clean(
    task?.subject ||
      task?.subject_name ||
      task?.subjectName ||
      task?.metadata?.subject ||
      task?.metadata?.subjectName
  );
}

function getTaskTutorReference(task) {
  return clean(
    task?.tutor_reference ||
      task?.tutorReference ||
      task?.reference ||
      task?.metadata?.tutorReference ||
      task?.metadata?.tutor_reference ||
      task?.metadata?.reference
  );
}

function getTaskActivityType(task) {
  return clean(
    task?.activity_type ||
      task?.activityType ||
      task?.type ||
      task?.metadata?.activityType ||
      task?.metadata?.activity_type ||
      "task"
  );
}

function isTaskActivity(task) {
  const type =
    normalize(
      getTaskActivityType(task)
    );

  return (
    type === "task" ||
    type === "tasks" ||
    type === "class task" ||
    type === "class_task"
  );
}

function getTaskMetadata(task) {
  return safeJsonParse(
    task?.metadata,
    {}
  );
}

function getTaskMaxScore(task) {
  const metadata =
    getTaskMetadata(task);

  const value =
    task?.max_score ??
    task?.maxScore ??
    metadata?.maxScore ??
    metadata?.max_score;

  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return null;
  }

  const number =
    Number(value);

  return Number.isFinite(number)
    ? number
    : null;
}

function taskBelongsToStudent(
  task,
  enrollment
) {
  if (
    !task ||
    !enrollment
  ) {
    return false;
  }

  const taskClass =
    getTaskGrade(task);

  const studentClass =
    getEnrollmentClass(
      enrollment
    );

  if (
    taskClass &&
    studentClass &&
    normalize(taskClass) !==
      normalize(studentClass)
  ) {
    return false;
  }

  const taskSubject =
    getTaskSubject(task);

  if (!taskSubject) {
    return true;
  }

  const studentSubjects =
    getEnrollmentSubjects(
      enrollment
    );

  if (!studentSubjects.length) {
    return true;
  }

  return studentSubjects.some(
    (subject) =>
      normalize(subject) ===
      normalize(taskSubject)
  );
}

/* =========================================================
   DYNAMIC CLASS ACTIVITY SELECT
   IMPORTANT:
   Every alias used later in the SQL MUST EXIST.
   Missing physical columns become NULL.
========================================================= */

function buildClassActivitySelect(
  columns
) {
  const available =
    columnNames(columns);

  const selections = [];

  /* -------------------------------------------------------
     ID
  ------------------------------------------------------- */

  if (available.has("id")) {
    selections.push(
      `"id" AS "id"`
    );
  } else {
    selections.push(
      `NULL::text AS "id"`
    );
  }

  /* -------------------------------------------------------
     TEXT EXPRESSION
  ------------------------------------------------------- */

  function textExpression(
    names,
    alias
  ) {
    const column =
      firstExistingColumn(
        names,
        available
      );

    if (!column) {
      return `NULL::text AS "${alias}"`;
    }

    return `"${column}"::text AS "${alias}"`;
  }

  /* -------------------------------------------------------
     JSON EXPRESSION
  ------------------------------------------------------- */

  function jsonExpression(
    names,
    alias
  ) {
    const column =
      firstExistingColumn(
        names,
        available
      );

    if (!column) {
      return `'{}'::jsonb AS "${alias}"`;
    }

    const info =
      getColumnInfo(
        column,
        columns
      );

    const dataType =
      info?.data_type;

    if (
      dataType === "jsonb"
    ) {
      return `"${column}" AS "${alias}"`;
    }

    if (
      dataType === "json"
    ) {
      return `"${column}"::jsonb AS "${alias}"`;
    }

    /*
     * For text/varchar metadata, do NOT use
     * PostgreSQL IS JSON syntax. It can fail on
     * PostgreSQL installations that do not support it.
     *
     * Invalid JSON safely becomes an empty object.
     */
    return `
      CASE
        WHEN NULLIF(TRIM("${column}"::text), '') IS NULL
          THEN '{}'::jsonb
        WHEN LEFT(TRIM("${column}"::text), 1) = '{'
             AND RIGHT(TRIM("${column}"::text), 1) = '}'
          THEN
            CASE
              WHEN "${column}"::text ~ '^\\s*\\{.*\\}\\s*$'
                THEN "${column}"::text::jsonb
              ELSE '{}'::jsonb
            END
        ELSE '{}'::jsonb
      END AS "${alias}"
    `;
  }

  /* -------------------------------------------------------
     TIMESTAMP EXPRESSION
  ------------------------------------------------------- */

  function timestampExpression(
    names,
    alias
  ) {
    const column =
      firstExistingColumn(
        names,
        available
      );

    if (!column) {
      return `NULL::timestamptz AS "${alias}"`;
    }

    return `
      CASE
        WHEN "${column}" IS NULL
          THEN NULL::timestamptz
        ELSE "${column}"::timestamptz
      END AS "${alias}"
    `;
  }

  /* -------------------------------------------------------
     NUMERIC EXPRESSION
  ------------------------------------------------------- */

  function numericExpression(
    names,
    alias
  ) {
    const column =
      firstExistingColumn(
        names,
        available
      );

    if (!column) {
      return `NULL::numeric AS "${alias}"`;
    }

    const info =
      getColumnInfo(
        column,
        columns
      );

    const numericTypes = new Set([
      "smallint",
      "integer",
      "bigint",
      "numeric",
      "decimal",
      "real",
      "double precision",
    ]);

    if (
      numericTypes.has(
        info?.data_type
      )
    ) {
      return `
        "${column}"::numeric
        AS "${alias}"
      `;
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
  }

  /* -------------------------------------------------------
     REQUIRED ALIASES
  ------------------------------------------------------- */

  selections.push(
    textExpression(
      [
        "title",
        "name",
      ],
      "title"
    )
  );

  selections.push(
    textExpression(
      [
        "description",
        "details",
      ],
      "description"
    )
  );

  selections.push(
    textExpression(
      [
        "instructions",
        "instruction",
        "task_instructions",
        "taskInstructions",
      ],
      "instructions"
    )
  );

  selections.push(
    textExpression(
      [
        "activity_type",
        "activityType",
        "type",
        "activity",
      ],
      "activity_type"
    )
  );

  selections.push(
    textExpression(
      [
        "grade",
        "class",
        "class_name",
        "className",
        "level",
      ],
      "grade"
    )
  );

  selections.push(
    textExpression(
      [
        "subject",
        "subject_name",
        "subjectName",
      ],
      "subject"
    )
  );

  selections.push(
    textExpression(
      [
        "tutor_reference",
        "tutorReference",
        "reference",
        "tutor_id",
        "tutorId",
      ],
      "tutor_reference"
    )
  );

  selections.push(
    jsonExpression(
      [
        "metadata",
      ],
      "metadata"
    )
  );

  selections.push(
    timestampExpression(
      [
        "due_date",
        "dueDate",
        "deadline",
      ],
      "due_date"
    )
  );

  selections.push(
    numericExpression(
      [
        "max_score",
        "maxScore",
        "points",
        "total_score",
      ],
      "max_score"
    )
  );

  selections.push(
    timestampExpression(
      [
        "created_at",
      ],
      "created_at"
    )
  );

  selections.push(
    timestampExpression(
      [
        "updated_at",
      ],
      "updated_at"
    )
  );

  return selections.join(",\n");
}

/* =========================================================
   FIND TASK BY ID
========================================================= */

async function findTaskById(
  taskId
) {
  const id =
    clean(taskId);

  if (!id) {
    return null;
  }

  const columns =
    await getClassActivityColumns();

  if (!columns.length) {
    return null;
  }

  const available =
    columnNames(columns);

  const select =
    buildClassActivitySelect(
      columns
    );

  if (!available.has("id")) {
    return null;
  }

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

  if (
    result.rows.length
  ) {
    return result.rows[0];
  }

  /*
   * Compatibility fallback for databases
   * where the task identifier was stored under
   * another activity ID column.
   */

  const alternativeId =
    firstExistingColumn(
      [
        "activity_id",
        "activityId",
        "task_id",
        "taskId",
      ],
      available
    );

  if (!alternativeId) {
    return null;
  }

  const fallback =
    await pool.query(
      `
        SELECT
          ${select}
        FROM class_activities
        WHERE "${alternativeId}"::text = $1
        LIMIT 1
      `,
      [id]
    );

  return (
    fallback.rows[0] ||
    null
  );
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

  const requiredColumns = [
    [
      "task_id",
      `
        ALTER TABLE academy_task_submissions
        ADD COLUMN IF NOT EXISTS task_id TEXT
      `,
    ],

    [
      "student_id",
      `
        ALTER TABLE academy_task_submissions
        ADD COLUMN IF NOT EXISTS student_id TEXT
      `,
    ],

    [
      "student_name",
      `
        ALTER TABLE academy_task_submissions
        ADD COLUMN IF NOT EXISTS student_name TEXT
      `,
    ],

    [
      "student_email",
      `
        ALTER TABLE academy_task_submissions
        ADD COLUMN IF NOT EXISTS student_email TEXT
      `,
    ],

    [
      "grade",
      `
        ALTER TABLE academy_task_submissions
        ADD COLUMN IF NOT EXISTS grade TEXT
      `,
    ],

    [
      "subject",
      `
        ALTER TABLE academy_task_submissions
        ADD COLUMN IF NOT EXISTS subject TEXT
      `,
    ],

    [
      "response_text",
      `
        ALTER TABLE academy_task_submissions
        ADD COLUMN IF NOT EXISTS response_text TEXT
      `,
    ],

    [
      "attachments",
      `
        ALTER TABLE academy_task_submissions
        ADD COLUMN IF NOT EXISTS attachments
        JSONB DEFAULT '[]'::jsonb
      `,
    ],

    [
      "status",
      `
        ALTER TABLE academy_task_submissions
        ADD COLUMN IF NOT EXISTS status
        TEXT DEFAULT 'submitted'
      `,
    ],

    [
      "score",
      `
        ALTER TABLE academy_task_submissions
        ADD COLUMN IF NOT EXISTS score NUMERIC
      `,
    ],

    [
      "max_score",
      `
        ALTER TABLE academy_task_submissions
        ADD COLUMN IF NOT EXISTS max_score NUMERIC
      `,
    ],

    [
      "feedback",
      `
        ALTER TABLE academy_task_submissions
        ADD COLUMN IF NOT EXISTS feedback TEXT
      `,
    ],

    [
      "submitted_at",
      `
        ALTER TABLE academy_task_submissions
        ADD COLUMN IF NOT EXISTS submitted_at
        TIMESTAMPTZ DEFAULT NOW()
      `,
    ],

    [
      "reviewed_at",
      `
        ALTER TABLE academy_task_submissions
        ADD COLUMN IF NOT EXISTS reviewed_at
        TIMESTAMPTZ
      `,
    ],

    [
      "reviewed_by",
      `
        ALTER TABLE academy_task_submissions
        ADD COLUMN IF NOT EXISTS reviewed_by TEXT
      `,
    ],

    [
      "created_at",
      `
        ALTER TABLE academy_task_submissions
        ADD COLUMN IF NOT EXISTS created_at
        TIMESTAMPTZ DEFAULT NOW()
      `,
    ],

    [
      "updated_at",
      `
        ALTER TABLE academy_task_submissions
        ADD COLUMN IF NOT EXISTS updated_at
        TIMESTAMPTZ DEFAULT NOW()
      `,
    ],
  ];

  for (const [, sql] of requiredColumns) {
    await pool.query(sql);
  }

  await pool.query(`
    CREATE INDEX IF NOT EXISTS
      idx_academy_task_submissions_task_id
    ON academy_task_submissions(task_id)
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS
      idx_academy_task_submissions_student_id
    ON academy_task_submissions(student_id)
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS
      idx_academy_task_submissions_student_email
    ON academy_task_submissions(student_email)
  `);
}

/* =========================================================
   NORMALIZE SUBMISSION
========================================================= */

function normalizeSubmission(row) {
  let attachments = [];

  if (
    Array.isArray(
      row?.attachments
    )
  ) {
    attachments =
      row.attachments;
  } else if (
    typeof row?.attachments ===
    "string"
  ) {
    try {
      const parsed =
        JSON.parse(
          row.attachments
        );

      if (
        Array.isArray(parsed)
      ) {
        attachments =
          parsed;
      }
    } catch {}
  }

  const taskMetadata =
    safeJsonParse(
      row?.task_metadata,
      {}
    );

  return {
    ...row,

    id: row?.id,

    taskId:
      row?.task_id ||
      row?.taskId ||
      null,

    task_id:
      row?.task_id ||
      null,

    taskTitle:
      row?.task_title ||
      row?.title ||
      "",

    taskDescription:
      row?.task_description ||
      row?.description ||
      "",

    taskInstructions:
      row?.task_instructions ||
      row?.instructions ||
      taskMetadata?.instructions ||
      "",

    taskActivityType:
      row?.task_activity_type ||
      row?.activity_type ||
      "task",

    taskGrade:
      row?.task_grade ||
      row?.grade ||
      "",

    taskSubject:
      row?.task_subject ||
      row?.subject ||
      "",

    taskMetadata,

    taskCreatedAt:
      row?.task_created_at ||
      null,

    studentId:
      row?.student_id ||
      row?.studentId ||
      null,

    studentName:
      row?.student_name ||
      row?.studentName ||
      "",

    studentEmail:
      row?.student_email ||
      row?.studentEmail ||
      "",

    grade:
      row?.grade ||
      "",

    subject:
      row?.subject ||
      "",

    responseText:
      row?.response_text ||
      row?.responseText ||
      "",

    attachments,

    status:
      row?.status ||
      "submitted",

    score:
      row?.score === null ||
      row?.score === undefined
        ? null
        : Number(row.score),

    maxScore:
      row?.max_score === null ||
      row?.max_score === undefined
        ? null
        : Number(row.max_score),

    feedback:
      row?.feedback ||
      "",

    submittedAt:
      row?.submitted_at ||
      row?.submittedAt ||
      row?.created_at ||
      null,

    reviewedAt:
      row?.reviewed_at ||
      row?.reviewedAt ||
      null,

    reviewedBy:
      row?.reviewed_by ||
      row?.reviewedBy ||
      null,
  };
}

/* =========================================================
   HEALTH
========================================================= */

router.get(
  "/task-submissions/health",
  async (_req, res) => {
    try {
      await pool.query(
        "SELECT 1"
      );

      await ensureSubmissionTable();

      const classActivitiesExists =
        await tableExists(
          "class_activities"
        );

      return res.json({
        success: true,

        message:
          "Task submission service is working.",

        database: true,

        classActivities:
          classActivitiesExists,
      });
    } catch (error) {
      console.error(
        "Task submission health error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Task submission service is unavailable.",

        code:
          error?.code ||
          "TASK_SUBMISSION_HEALTH_ERROR",

        detail:
          error?.detail ||
          null,

        hint:
          error?.hint ||
          null,
      });
    }
  }
);

/* =========================================================
   STUDENT SUBMIT TASK
========================================================= */

router.post(
  "/student/task-submissions",
  upload.array(
    "files",
    MAX_FILES
  ),
  async (req, res) => {
    const uploadedFiles =
      req.files || [];

    try {
      await ensureSubmissionTable();

      const taskId =
        getTaskId(req);

      if (!taskId) {
        deleteUploadedFiles(
          uploadedFiles
        );

        return res.status(400).json({
          success: false,

          code:
            "TASK_ID_REQUIRED",

          message:
            "Task ID is required.",
        });
      }

      const enrollment =
        await findStudentEnrollment(
          req
        );

      if (!enrollment) {
        deleteUploadedFiles(
          uploadedFiles
        );

        return res.status(403).json({
          success: false,

          code:
            "STUDENT_NOT_ENROLLED",

          message:
            "Your student enrollment could not be verified.",
        });
      }

      const task =
        await findTaskById(
          taskId
        );

      if (!task) {
        deleteUploadedFiles(
          uploadedFiles
        );

        return res.status(404).json({
          success: false,

          code:
            "TASK_NOT_FOUND",

          message:
            "The task could not be found.",
        });
      }

      if (
        !isTaskActivity(task)
      ) {
        deleteUploadedFiles(
          uploadedFiles
        );

        return res.status(400).json({
          success: false,

          code:
            "INVALID_TASK",

          message:
            "This activity is not a student task.",
        });
      }

      if (
        !taskBelongsToStudent(
          task,
          enrollment
        )
      ) {
        deleteUploadedFiles(
          uploadedFiles
        );

        return res.status(403).json({
          success: false,

          code:
            "TASK_NOT_AVAILABLE",

          message:
            "This task is not assigned to your class or subject.",
        });
      }

      const responseText =
        clean(
          req.body?.responseText ||
            req.body?.response_text ||
            req.body?.answer ||
            req.body?.submissionText ||
            req.body?.submission_text
        );

      if (
        !responseText &&
        uploadedFiles.length === 0
      ) {
        deleteUploadedFiles(
          uploadedFiles
        );

        return res.status(400).json({
          success: false,

          code:
            "SUBMISSION_EMPTY",

          message:
            "Please provide an answer or upload at least one file.",
        });
      }

      const studentId =
        getStudentId(req) ||
        getEnrollmentStudentId(
          enrollment
        );

      const studentEmail =
        getStudentEmail(req) ||
        getEnrollmentEmail(
          enrollment
        );

      const studentName =
        getStudentName(req) ||
        getEnrollmentName(
          enrollment
        );

      const grade =
        getTaskGrade(task) ||
        getEnrollmentClass(
          enrollment
        );

      const subject =
        getTaskSubject(task);

      const attachments =
        buildAttachments(
          uploadedFiles
        );

      const existingResult =
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
                  AND LOWER(student_email) =
                    LOWER($3)
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

      const existing =
        existingResult.rows[0] ||
        null;

      const insertResult =
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
              max_score,
              submitted_at,
              created_at,
              updated_at
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
              $9,
              NOW(),
              NOW(),
              NOW()
            )
            RETURNING *
          `,
          [
            taskId,

            studentId ||
              null,

            studentName ||
              null,

            studentEmail ||
              null,

            grade ||
              null,

            subject ||
              null,

            responseText ||
              null,

            JSON.stringify(
              attachments
            ),

            getTaskMaxScore(
              task
            ),
          ]
        );

      return res.status(201).json({
        success: true,

        message:
          existing
            ? "Task resubmitted successfully."
            : "Task submitted successfully.",

        submission:
          normalizeSubmission(
            insertResult.rows[0]
          ),

        task,

        previousSubmission:
          existing
            ? normalizeSubmission(
                existing
              )
            : null,
      });
    } catch (error) {
      deleteUploadedFiles(
        uploadedFiles
      );

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
          error?.detail ||
          null,

        hint:
          error?.hint ||
          null,

        table:
          error?.table ||
          null,

        column:
          error?.column ||
          null,

        constraint:
          error?.constraint ||
          null,
      });
    }
  }
);

/* =========================================================
   STUDENT GET MY SUBMISSIONS
========================================================= */

router.get(
  "/student/task-submissions",
  async (req, res) => {
    try {
      await ensureSubmissionTable();

      const studentId =
        clean(
          req.query?.studentId ||
            req.query?.student_id ||
            req.query?.userId ||
            req.query?.user_id ||
            req.headers[
              "x-student-id"
            ]
        );

      const studentEmail =
        clean(
          req.query?.email ||
            req.query?.studentEmail ||
            req.query?.student_email ||
            req.headers[
              "x-student-email"
            ]
        ).toLowerCase();

      const studentName =
        clean(
          req.query?.fullName ||
            req.query?.full_name ||
            req.query?.studentName ||
            req.query?.student_name
        );

      if (
        !studentId &&
        !studentEmail &&
        !studentName
      ) {
        return res.status(400).json({
          success: false,

          code:
            "STUDENT_IDENTIFIER_REQUIRED",

          message:
            "Student ID, email, or full name is required.",
        });
      }

      const result =
        await pool.query(
          `
            SELECT
              s.*
            FROM academy_task_submissions s
            WHERE
              (
                $1 <> ''
                AND s.student_id = $1
              )
              OR
              (
                $2 <> ''
                AND LOWER(s.student_email) =
                  LOWER($2)
              )
              OR
              (
                $3 <> ''
                AND LOWER(s.student_name) =
                  LOWER($3)
              )
            ORDER BY
              s.submitted_at DESC
          `,
          [
            studentId,
            studentEmail,
            studentName,
          ]
        );

      const submissions =
        result.rows.map(
          normalizeSubmission
        );

      return res.json({
        success: true,

        submissions,

        data: submissions,

        count:
          submissions.length,
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
          "Unable to load your task submissions.",

        detail:
          error?.detail ||
          null,

        hint:
          error?.hint ||
          null,
      });
    }
  }
);

/* =========================================================
   STUDENT GET SINGLE SUBMISSION
========================================================= */

router.get(
  "/student/task-submissions/:submissionId",
  async (req, res) => {
    try {
      await ensureSubmissionTable();

      const submissionId =
        clean(
          req.params?.submissionId
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

      const studentId =
        clean(
          req.query?.studentId ||
            req.query?.student_id ||
            req.query?.userId ||
            req.query?.user_id
        );

      const studentEmail =
        clean(
          req.query?.email ||
            req.query?.studentEmail ||
            req.query?.student_email
        ).toLowerCase();

      const studentName =
        clean(
          req.query?.fullName ||
            req.query?.full_name ||
            req.query?.studentName ||
            req.query?.student_name
        );

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

      if (
        !result.rows.length
      ) {
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

      if (
        studentId &&
        normalize(
          submission.student_id
        ) !==
          normalize(studentId)
      ) {
        return res.status(403).json({
          success: false,

          message:
            "You do not have access to this submission.",
        });
      }

      if (
        !studentId &&
        studentEmail &&
        normalize(
          submission.student_email
        ) !==
          normalize(studentEmail)
      ) {
        return res.status(403).json({
          success: false,

          message:
            "You do not have access to this submission.",
        });
      }

      if (
        !studentId &&
        !studentEmail &&
        studentName &&
        normalize(
          submission.student_name
        ) !==
          normalize(studentName)
      ) {
        return res.status(403).json({
          success: false,

          message:
            "You do not have access to this submission.",
        });
      }

      return res.json({
        success: true,

        submission:
          normalizeSubmission(
            submission
          ),
      });
    } catch (error) {
      console.error(
        "Load single student submission error:",
        error
      );

      return res.status(500).json({
        success: false,

        code:
          error?.code ||
          "STUDENT_SUBMISSION_LOAD_ERROR",

        message:
          error?.message ||
          "Unable to load submission.",

        detail:
          error?.detail ||
          null,

        hint:
          error?.hint ||
          null,
      });
    }
  }
);

/* =========================================================
   TUTOR GET ALL TASK SUBMISSIONS
========================================================= */

router.get(
  "/tutor/task-submissions",
  async (req, res) => {
    try {
      await ensureSubmissionTable();

      const reference =
        clean(
          req.query?.reference ||
            req.query?.tutorReference ||
            req.query?.tutor_reference ||
            req.query?.applicationReference ||
            req.query?.application_reference ||
            req.headers[
              "x-tutor-reference"
            ]
        );

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
        await verifyTutor(
          reference
        );

      if (
        tutorCheck.error
      ) {
        return res.status(
          tutorCheck.error.status
        ).json({
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

      const columns =
        await getClassActivityColumns();

      if (!columns.length) {
        return res.json({
          success: true,

          submissions: [],

          data: [],

          count: 0,

          tutorReference,

          message:
            "No class activities table is available yet.",
        });
      }

      const available =
        columnNames(columns);

      const tutorColumn =
        firstExistingColumn(
          [
            "tutor_reference",
            "tutorReference",
            "reference",
          ],
          available
        );

      const select =
        buildClassActivitySelect(
          columns
        );

      let result;

      if (tutorColumn) {
        result =
          await pool.query(
            `
              SELECT
                s.*,

                a.title AS task_title,
                a.description AS task_description,
                a.instructions AS task_instructions,
                a.activity_type AS task_activity_type,
                a.grade AS task_grade,
                a.subject AS task_subject,
                a.metadata AS task_metadata,
                a.tutor_reference AS task_tutor_reference,
                a.created_at AS task_created_at

              FROM academy_task_submissions s

              LEFT JOIN (
                SELECT
                  ${select}
                FROM class_activities
              ) a
                ON a.id::text =
                   s.task_id::text

              WHERE
                LOWER(
                  COALESCE(
                    a.tutor_reference,
                    ''
                  )
                ) = LOWER($1)

              ORDER BY
                s.submitted_at DESC
            `,
            [tutorReference]
          );
      } else {
        result =
          await pool.query(
            `
              SELECT
                s.*,

                a.title AS task_title,
                a.description AS task_description,
                a.instructions AS task_instructions,
                a.activity_type AS task_activity_type,
                a.grade AS task_grade,
                a.subject AS task_subject,
                a.metadata AS task_metadata,
                a.tutor_reference AS task_tutor_reference,
                a.created_at AS task_created_at

              FROM academy_task_submissions s

              LEFT JOIN (
                SELECT
                  ${select}
                FROM class_activities
              ) a
                ON a.id::text =
                   s.task_id::text

              WHERE
                LOWER(
                  COALESCE(
                    a.metadata->>'tutorReference',
                    a.metadata->>'tutor_reference',
                    a.metadata->>'reference',
                    ''
                  )
                ) = LOWER($1)

              ORDER BY
                s.submitted_at DESC
            `,
            [tutorReference]
          );
      }

      const submissions =
        result.rows
          .map(normalizeSubmission)
          .filter((item) =>
            isTaskActivity({
              activity_type:
                item.taskActivityType,

              metadata:
                item.taskMetadata,
            })
          );

      return res.json({
        success: true,

        submissions,

        data: submissions,

        count:
          submissions.length,

        tutorReference,

        tutorName:
          getTutorName(tutor),
      });
    } catch (error) {
      console.error(
        "Load tutor task submissions error:",
        error
      );

      return res.status(500).json({
        success: false,

        code:
          error?.code ||
          "TUTOR_SUBMISSIONS_LOAD_ERROR",

        message:
          error?.message ||
          "Unable to load task submissions.",

        detail:
          error?.detail ||
          null,

        hint:
          error?.hint ||
          null,

        table:
          error?.table ||
          null,

        column:
          error?.column ||
          null,
      });
    }
  }
);

/* =========================================================
   TUTOR GET SINGLE SUBMISSION
========================================================= */

router.get(
  "/tutor/task-submissions/:submissionId",
  async (req, res) => {
    try {
      await ensureSubmissionTable();

      const reference =
        clean(
          req.query?.reference ||
            req.query?.tutorReference ||
            req.query?.tutor_reference ||
            req.headers[
              "x-tutor-reference"
            ]
        );

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
        await verifyTutor(
          reference
        );

      if (
        tutorCheck.error
      ) {
        return res.status(
          tutorCheck.error.status
        ).json({
          success: false,

          code:
            tutorCheck.error.code,

          message:
            tutorCheck.error.message,
        });
      }

      const submissionId =
        clean(
          req.params?.submissionId
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

      if (
        !result.rows.length
      ) {
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

          code:
            "TASK_NOT_FOUND",

          message:
            "The task connected to this submission could not be found.",
        });
      }

      const tutorReference =
        getTutorReference(
          tutorCheck.tutor
        );

      const taskTutorReference =
        getTaskTutorReference(
          task
        );

      if (
        taskTutorReference &&
        normalize(
          taskTutorReference
        ) !==
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
        normalizeSubmission({
          ...submission,

          task_title:
            task?.title || "",

          task_description:
            task?.description || "",

          task_instructions:
            task?.instructions || "",

          task_activity_type:
            getTaskActivityType(
              task
            ),

          task_grade:
            getTaskGrade(task),

          task_subject:
            getTaskSubject(task),

          task_metadata:
            task?.metadata || {},

          task_tutor_reference:
            taskTutorReference,

          task_created_at:
            task?.created_at || null,
        });

      return res.json({
        success: true,

        submission:
          normalized,

        task,
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
          error?.detail ||
          null,

        hint:
          error?.hint ||
          null,
      });
    }
  }
);

/* =========================================================
   TUTOR REVIEW / GRADE SUBMISSION
========================================================= */

router.patch(
  "/tutor/task-submissions/:submissionId/review",
  async (req, res) => {
    try {
      await ensureSubmissionTable();

      const reference =
        clean(
          req.body?.reference ||
            req.body?.tutorReference ||
            req.body?.tutor_reference ||
            req.query?.reference ||
            req.query?.tutorReference ||
            req.query?.tutor_reference ||
            req.headers[
              "x-tutor-reference"
            ]
        );

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
        await verifyTutor(
          reference
        );

      if (
        tutorCheck.error
      ) {
        return res.status(
          tutorCheck.error.status
        ).json({
          success: false,

          code:
            tutorCheck.error.code,

          message:
            tutorCheck.error.message,
        });
      }

      const submissionId =
        clean(
          req.params?.submissionId
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

      const scoreValue =
        req.body?.score;

      const maxScoreValue =
        req.body?.maxScore ??
        req.body?.max_score;

      const feedback =
        clean(
          req.body?.feedback ||
            req.body?.comment ||
            req.body?.comments
        );

      const requestedStatus =
        normalize(
          req.body?.status ||
            "reviewed"
        );

      let status =
        requestedStatus;

      if (
        ![
          "submitted",
          "reviewed",
          "returned",
        ].includes(status)
      ) {
        status = "reviewed";
      }

      let score = null;

      if (
        scoreValue !==
          undefined &&
        scoreValue !== null &&
        scoreValue !== ""
      ) {
        score =
          Number(scoreValue);

        if (
          !Number.isFinite(score) ||
          score < 0
        ) {
          return res.status(400).json({
            success: false,

            code:
              "INVALID_SCORE",

            message:
              "Score must be a valid non-negative number.",
          });
        }
      }

      let maxScore = null;

      if (
        maxScoreValue !==
          undefined &&
        maxScoreValue !== null &&
        maxScoreValue !== ""
      ) {
        maxScore =
          Number(maxScoreValue);

        if (
          !Number.isFinite(
            maxScore
          ) ||
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

      if (
        !result.rows.length
      ) {
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

          code:
            "TASK_NOT_FOUND",

          message:
            "The task connected to this submission could not be found.",
        });
      }

      const tutorReference =
        getTutorReference(
          tutorCheck.tutor
        );

      const taskTutorReference =
        getTaskTutorReference(
          task
        );

      if (
        taskTutorReference &&
        normalize(
          taskTutorReference
        ) !==
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

      if (
        maxScore === null
      ) {
        maxScore =
          submission.max_score !==
            null &&
          submission.max_score !==
            undefined
            ? Number(
                submission.max_score
              )
            : getTaskMaxScore(
                task
              );
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

      const updateResult =
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

            feedback ||
              null,

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
            updateResult.rows[0]
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
          error?.detail ||
          null,

        hint:
          error?.hint ||
          null,
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
        clean(
          req.query?.reference ||
            req.query?.tutorReference ||
            req.query?.tutor_reference ||
            req.headers[
              "x-tutor-reference"
            ]
        );

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
        await verifyTutor(
          reference
        );

      if (
        tutorCheck.error
      ) {
        return res.status(
          tutorCheck.error.status
        ).json({
          success: false,

          code:
            tutorCheck.error.code,

          message:
            tutorCheck.error.message,
        });
      }

      const taskId =
        clean(
          req.params?.taskId
        );

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
        await findTaskById(
          taskId
        );

      if (!task) {
        return res.status(404).json({
          success: false,

          code:
            "TASK_NOT_FOUND",

          message:
            "The task could not be found.",
        });
      }

      if (
        !isTaskActivity(task)
      ) {
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

      const taskTutorReference =
        getTaskTutorReference(
          task
        );

      if (
        taskTutorReference &&
        normalize(
          taskTutorReference
        ) !==
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
        result.rows.map(
          normalizeSubmission
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
              normalizeStatus(
                item.status
              ) ===
              "submitted"
          ).length,

        reviewedCount:
          submissions.filter(
            (item) =>
              normalizeStatus(
                item.status
              ) ===
              "reviewed"
          ).length,

        returnedCount:
          submissions.filter(
            (item) =>
              normalizeStatus(
                item.status
              ) ===
              "returned"
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
          error?.detail ||
          null,

        hint:
          error?.hint ||
          null,
      });
    }
  }
);

/* =========================================================
   MULTER ERROR HANDLER
========================================================= */

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
