import express from "express";
import jwt from "jsonwebtoken";
import pool from "../lib/db.js";

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;

// ============================================================
// ADMIN AUTHENTICATION
// ============================================================

const requireAdmin = (req, res, next) => {
  try {
    if (!JWT_SECRET) {
      return res.status(500).json({
        success: false,
        error: "JWT_SECRET is not configured.",
      });
    }

    const authorization = req.headers.authorization || "";

    if (!authorization.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: "Authentication token is required.",
      });
    }

    const token = authorization.slice(7).trim();
    const decoded = jwt.verify(token, JWT_SECRET);

    const role = String(
      decoded.role ||
      decoded.userType ||
      decoded.user_type ||
      decoded.accountType ||
      ""
    ).toLowerCase();

    const isAdmin =
      decoded.isAdmin === true ||
      decoded.is_admin === true ||
      role === "admin" ||
      role === "superadmin" ||
      role === "super_admin";

    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        error: "Administrator access is required.",
      });
    }

    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error:
        error.name === "TokenExpiredError"
          ? "Your session has expired. Please log in again."
          : "Invalid authentication token.",
    });
  }
};

// ============================================================
// DATABASE TABLES AND SCHEDULE MIGRATION
// ============================================================

let tablesReady = false;
let tablesPromise = null;

const ensureTables = async () => {
  if (tablesReady) return;

  if (tablesPromise) {
    await tablesPromise;
    return;
  }

  tablesPromise = (async () => {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS school_exams (
        id BIGSERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        exam_type VARCHAR(100) NOT NULL DEFAULT 'School Examination',
        class_name VARCHAR(100) NOT NULL,
        subject VARCHAR(150) NOT NULL,
        duration_minutes INTEGER NOT NULL DEFAULT 60,
        instructions TEXT,
        status VARCHAR(30) NOT NULL DEFAULT 'draft',
        total_questions INTEGER NOT NULL DEFAULT 0,
        created_by TEXT,
        scheduled_start_at TIMESTAMPTZ,
        scheduled_end_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // Upgrade existing school_exams tables.
    await pool.query(`
      ALTER TABLE school_exams
      ADD COLUMN IF NOT EXISTS scheduled_start_at TIMESTAMPTZ;
    `);

    await pool.query(`
      ALTER TABLE school_exams
      ADD COLUMN IF NOT EXISTS scheduled_end_at TIMESTAMPTZ;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS school_exam_questions (
        id BIGSERIAL PRIMARY KEY,
        exam_id BIGINT NOT NULL
          REFERENCES school_exams(id)
          ON DELETE CASCADE,
        question_order INTEGER NOT NULL DEFAULT 1,
        question_type VARCHAR(30) NOT NULL DEFAULT 'objective',
        question_text TEXT NOT NULL,
        options JSONB NOT NULL DEFAULT '[]'::jsonb,
        correct_answer TEXT NOT NULL,
        explanation TEXT,
        image_url TEXT,
        passage_id TEXT,
        passage_title TEXT,
        passage TEXT,
        passage_order INTEGER,
        marks NUMERIC(8,2) NOT NULL DEFAULT 1,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS
      idx_school_exams_class_subject
      ON school_exams(class_name, subject);
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS
      idx_school_exams_created_at
      ON school_exams(created_at DESC);
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS
      idx_school_exams_schedule
      ON school_exams(scheduled_start_at, scheduled_end_at);
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS
      idx_school_exam_questions_exam_order
      ON school_exam_questions(exam_id, question_order);
    `);

    tablesReady = true;
  })();

  try {
    await tablesPromise;
  } catch (error) {
    tablesPromise = null;
    throw error;
  }
};

// ============================================================
// HELPERS
// ============================================================

const clean = (value) => String(value ?? "").trim();

/**
 * datetime-local values have no timezone information.
 * Interpret those values as Africa/Lagos (UTC+1).
 *
 * Values already containing Z or a timezone offset are
 * interpreted as explicit timestamps.
 */
const normalizeScheduleDate = (value) => {
  if (
    value === undefined ||
    value === null ||
    String(value).trim() === ""
  ) {
    return null;
  }

  const raw = String(value).trim();

  let date;

  const localDateTimeMatch = raw.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/
  );

  if (localDateTimeMatch) {
    const [
      ,
      year,
      month,
      day,
      hour,
      minute,
      second = "0",
    ] = localDateTimeMatch;

    // Nigeria is UTC+1.
    date = new Date(
      Date.UTC(
        Number(year),
        Number(month) - 1,
        Number(day),
        Number(hour) - 1,
        Number(minute),
        Number(second)
      )
    );
  } else {
    date = new Date(raw);
  }

  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  return date.toISOString();
};

const normalizeOptions = (options) => {
  if (Array.isArray(options)) {
    return options.map((option, index) => {
      if (typeof option === "string") {
        return {
          label: String.fromCharCode(65 + index),
          text: clean(option),
        };
      }

      return {
        label:
          clean(option?.label) ||
          String.fromCharCode(65 + index),
        text: clean(
          option?.text ??
          option?.value ??
          ""
        ),
      };
    });
  }

  if (options && typeof options === "object") {
    return Object.entries(options).map(([label, value]) => ({
      label: clean(label),
      text: clean(value),
    }));
  }

  return [];
};

// ============================================================
// NORMALIZE QUESTION
// ============================================================

const normalizeQuestion = (question, index) => {
  const questionType = clean(
    question.question_type ||
    question.questionType ||
    "objective"
  ).toLowerCase();

  const rawPassageOrder =
    question.passage_order ??
    question.passageOrder;

  const passageOrder =
    rawPassageOrder !== undefined &&
    rawPassageOrder !== null &&
    rawPassageOrder !== ""
      ? Number(rawPassageOrder)
      : null;

  return {
    question_order: index + 1,

    question_type: questionType,

    question_text: clean(
      question.question_text ||
      question.questionText ||
      question.question
    ),

    options: normalizeOptions(question.options),

    correct_answer: clean(
      question.correct_answer ||
      question.correctAnswer ||
      question.answer
    ),

    explanation: clean(
      question.explanation ||
      question.reason
    ),

    image_url:
      clean(
        question.image_url ||
        question.imageUrl ||
        question.image
      ) || null,

    passage_id:
      clean(
        question.passage_id ||
        question.passageId
      ) || null,

    passage_title:
      clean(
        question.passage_title ||
        question.passageTitle
      ) || null,

    passage: clean(question.passage) || null,

    passage_order:
      Number.isInteger(passageOrder) &&
      passageOrder > 0
        ? passageOrder
        : null,

    marks:
      Number.isFinite(Number(question.marks)) &&
      Number(question.marks) > 0
        ? Number(question.marks)
        : 1,
  };
};

// ============================================================
// VALIDATE QUESTION
// ============================================================

const validateQuestion = (question, index) => {
  if (!question.question_text) {
    return `Question ${index + 1}: Question text is required.`;
  }

  if (
    !["objective", "comprehension"].includes(
      question.question_type
    )
  ) {
    return `Question ${index + 1}: Invalid question type.`;
  }

  if (!question.correct_answer) {
    return `Question ${index + 1}: Correct answer is required.`;
  }

  if (question.question_type === "objective") {
    const filledOptions = question.options.filter(
      (option) => option.text.trim()
    );

    if (filledOptions.length < 2) {
      return `Question ${index + 1}: At least two answer options are required.`;
    }

    const correctOptionExists = filledOptions.some(
      (option) =>
        option.label.toLowerCase() ===
        question.correct_answer.toLowerCase()
    );

    if (!correctOptionExists) {
      return `Question ${index + 1}: The correct answer must match one of the available option labels.`;
    }
  }

  if (
    question.question_type === "comprehension" &&
    !question.passage
  ) {
    return `Question ${index + 1}: Comprehension passage is required.`;
  }

  if (
    !Number.isFinite(question.marks) ||
    question.marks <= 0
  ) {
    return `Question ${index + 1}: Marks must be greater than zero.`;
  }

  return null;
};

// ============================================================
// VALIDATE EXAMINATION DETAILS
// ============================================================

const validateExamPayload = (body = {}) => {
  const title = clean(body.title);

  const className = clean(
    body.class_name ||
    body.className ||
    body.class
  );

  const subject = clean(body.subject);

  const duration = Number(
    body.duration_minutes ??
    body.durationMinutes ??
    60
  );

  const status = clean(
    body.status || "draft"
  ).toLowerCase();

  const rawStart =
    body.scheduled_start_at ??
    body.scheduledStartAt ??
    body.start_at ??
    body.startAt ??
    "";

  const rawEnd =
    body.scheduled_end_at ??
    body.scheduledEndAt ??
    body.end_at ??
    body.endAt ??
    "";

  const hasStart = clean(rawStart) !== "";
  const hasEnd = clean(rawEnd) !== "";

  if (title.length < 3) {
    return {
      error: "Exam title must contain at least 3 characters.",
    };
  }

  if (!className) {
    return {
      error: "Class is required.",
    };
  }

  if (!subject) {
    return {
      error: "Subject is required.",
    };
  }

  if (
    !Number.isInteger(duration) ||
    duration < 1 ||
    duration > 1440
  ) {
    return {
      error: "Duration must be between 1 and 1440 minutes.",
    };
  }

  if (!["draft", "published"].includes(status)) {
    return {
      error: "Status must be draft or published.",
    };
  }

  if (hasStart !== hasEnd) {
    return {
      error: "Both examination start and end times are required.",
    };
  }

  const scheduledStartAt = normalizeScheduleDate(rawStart);
  const scheduledEndAt = normalizeScheduleDate(rawEnd);

  if (hasStart && !scheduledStartAt) {
    return {
      error: "The examination start date or time is invalid.",
    };
  }

  if (hasEnd && !scheduledEndAt) {
    return {
      error: "The examination end date or time is invalid.",
    };
  }

  if (
    scheduledStartAt &&
    scheduledEndAt &&
    new Date(scheduledEndAt).getTime() <=
      new Date(scheduledStartAt).getTime()
  ) {
    return {
      error: "The examination end time must be later than its start time.",
    };
  }

  if (
    !Array.isArray(body.questions) ||
    body.questions.length < 1
  ) {
    return {
      error: "Add at least one question before saving.",
    };
  }

  if (body.questions.length > 500) {
    return {
      error: "An examination cannot contain more than 500 questions.",
    };
  }

  const normalizedQuestions = body.questions.map(
    (question, index) =>
      normalizeQuestion(question || {}, index)
  );

  for (
    let index = 0;
    index < normalizedQuestions.length;
    index++
  ) {
    const validationError = validateQuestion(
      normalizedQuestions[index],
      index
    );

    if (validationError) {
      return {
        error: validationError,
      };
    }
  }

  return {
    data: {
      title,
      exam_type:
        clean(body.exam_type || body.examType) ||
        "School Examination",
      class_name: className,
      subject,
      duration_minutes: duration,
      instructions: clean(body.instructions),
      status,
      scheduled_start_at: scheduledStartAt,
      scheduled_end_at: scheduledEndAt,
      questions: normalizedQuestions,
    },
  };
};

// ============================================================
// INSERT QUESTIONS
// ============================================================

const insertQuestions = async (
  client,
  examId,
  questions
) => {
  for (const question of questions) {
    await client.query(
      `
        INSERT INTO school_exam_questions (
          exam_id,
          question_order,
          question_type,
          question_text,
          options,
          correct_answer,
          explanation,
          image_url,
          passage_id,
          passage_title,
          passage,
          passage_order,
          marks
        )
        VALUES (
          $1, $2, $3, $4, $5::jsonb, $6,
          $7, $8, $9, $10, $11, $12, $13
        )
      `,
      [
        examId,
        question.question_order,
        question.question_type,
        question.question_text,
        JSON.stringify(question.options),
        question.correct_answer,
        question.explanation,
        question.image_url,
        question.passage_id,
        question.passage_title,
        question.passage,
        question.passage_order,
        question.marks,
      ]
    );
  }
};

// ============================================================
// CREATE SCHOOL EXAMINATION
// POST /api/admin/school-exams
// ============================================================

router.post("/", requireAdmin, async (req, res) => {
  let client;

  try {
    await ensureTables();

    const validation = validateExamPayload(req.body);

    if (validation.error) {
      return res.status(400).json({
        success: false,
        error: validation.error,
      });
    }

    const examData = validation.data;

    client = await pool.connect();

    await client.query("BEGIN");

    const adminReference =
      req.admin.id ||
      req.admin.userId ||
      req.admin.user_id ||
      req.admin.email ||
      null;

    const examResult = await client.query(
      `
        INSERT INTO school_exams (
          title,
          exam_type,
          class_name,
          subject,
          duration_minutes,
          instructions,
          status,
          total_questions,
          created_by,
          scheduled_start_at,
          scheduled_end_at
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
        )
        RETURNING *
      `,
      [
        examData.title,
        examData.exam_type,
        examData.class_name,
        examData.subject,
        examData.duration_minutes,
        examData.instructions,
        examData.status,
        examData.questions.length,
        adminReference,
        examData.scheduled_start_at,
        examData.scheduled_end_at,
      ]
    );

    const exam = examResult.rows[0];

    await insertQuestions(
      client,
      exam.id,
      examData.questions
    );

    const savedQuestions = await client.query(
      `
        SELECT *
        FROM school_exam_questions
        WHERE exam_id = $1
        ORDER BY question_order ASC, id ASC
      `,
      [exam.id]
    );

    await client.query("COMMIT");

    return res.status(201).json({
      success: true,
      message: "School examination created successfully.",
      exam: {
        ...exam,
        questions: savedQuestions.rows,
        question_count: savedQuestions.rows.length,
      },
    });
  } catch (error) {
    if (client) {
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        console.error(
          "SCHOOL EXAM CREATE ROLLBACK ERROR:",
          rollbackError
        );
      }
    }

    console.error("SCHOOL EXAM CREATE ERROR:", error);

    return res.status(500).json({
      success: false,
      error: "Unable to create school examination.",
      details:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  } finally {
    if (client) client.release();
  }
});

// ============================================================
// GET ALL SCHOOL EXAMINATIONS WITH THEIR QUESTIONS
// GET /api/admin/school-exams
// ============================================================

router.get("/", requireAdmin, async (req, res) => {
  try {
    await ensureTables();

    const conditions = [];
    const values = [];

    const className = clean(req.query.class);
    const subject = clean(req.query.subject);
    const status = clean(req.query.status);

    if (className) {
      values.push(className);

      conditions.push(
        `LOWER(TRIM(e.class_name)) = LOWER(TRIM($${values.length}))`
      );
    }

    if (subject) {
      values.push(subject);

      conditions.push(
        `LOWER(TRIM(e.subject)) = LOWER(TRIM($${values.length}))`
      );
    }

    if (status) {
      values.push(status);

      conditions.push(
        `LOWER(e.status) = LOWER($${values.length})`
      );
    }

    const whereClause = conditions.length
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

    const result = await pool.query(
      `
        SELECT
          e.id,
          e.title,
          e.exam_type,
          e.class_name,
          e.subject,
          e.duration_minutes,
          e.instructions,
          e.status,
          e.total_questions,
          e.created_by,
          e.scheduled_start_at,
          e.scheduled_end_at,
          e.created_at,
          e.updated_at,

          COUNT(q.id)::INTEGER AS question_count,

          COALESCE(
            JSONB_AGG(
              TO_JSONB(q)
              ORDER BY q.question_order ASC, q.id ASC
            ) FILTER (WHERE q.id IS NOT NULL),
            '[]'::JSONB
          ) AS questions

        FROM school_exams e

        LEFT JOIN school_exam_questions q
          ON q.exam_id = e.id

        ${whereClause}

        GROUP BY e.id

        ORDER BY e.created_at DESC

        LIMIT 200
      `,
      values
    );

    const exams = result.rows.map((exam) => ({
      ...exam,
      total_questions: Number(exam.total_questions || 0),
      question_count: Number(exam.question_count || 0),
      questions: Array.isArray(exam.questions)
        ? exam.questions
        : [],
    }));

    const totalQuestions = exams.reduce(
      (total, exam) =>
        total + exam.question_count,
      0
    );

    return res.status(200).json({
      success: true,
      exams,
      count: exams.length,
      totalQuestions,
    });
  } catch (error) {
    console.error(
      "SCHOOL EXAMS WITH QUESTIONS FETCH ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      exams: [],
      count: 0,
      totalQuestions: 0,
      error: "Unable to fetch school examinations.",
      details:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
});

// ============================================================
// GET ONE SCHOOL EXAMINATION WITH ALL QUESTIONS
// GET /api/admin/school-exams/:id
// ============================================================

router.get("/:id", requireAdmin, async (req, res) => {
  try {
    await ensureTables();

    const { id } = req.params;

    if (!/^\d+$/.test(id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid examination ID.",
      });
    }

    const examResult = await pool.query(
      `
        SELECT *
        FROM school_exams
        WHERE id = $1
        LIMIT 1
      `,
      [id]
    );

    if (!examResult.rows.length) {
      return res.status(404).json({
        success: false,
        error: "School examination not found.",
      });
    }

    const questionsResult = await pool.query(
      `
        SELECT *
        FROM school_exam_questions
        WHERE exam_id = $1
        ORDER BY question_order ASC, id ASC
      `,
      [id]
    );

    return res.status(200).json({
      success: true,
      exam: {
        ...examResult.rows[0],
        questions: questionsResult.rows,
        question_count: questionsResult.rows.length,
      },
    });
  } catch (error) {
    console.error("SCHOOL EXAM DETAIL ERROR:", error);

    return res.status(500).json({
      success: false,
      error: "Unable to fetch school examination.",
      details:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
});

// ============================================================
// EDIT / UPDATE SCHOOL EXAMINATION
// PUT /api/admin/school-exams/:id
// ============================================================

router.put("/:id", requireAdmin, async (req, res) => {
  let client;

  try {
    await ensureTables();

    const { id } = req.params;

    if (!/^\d+$/.test(id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid examination ID.",
      });
    }

    const validation = validateExamPayload(req.body);

    if (validation.error) {
      return res.status(400).json({
        success: false,
        error: validation.error,
      });
    }

    const examData = validation.data;

    client = await pool.connect();

    await client.query("BEGIN");

    const existingExam = await client.query(
      `
        SELECT id
        FROM school_exams
        WHERE id = $1
        FOR UPDATE
      `,
      [id]
    );

    if (!existingExam.rows.length) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        success: false,
        error: "School examination not found.",
      });
    }

    const updatedExamResult = await client.query(
      `
        UPDATE school_exams
        SET
          title = $1,
          exam_type = $2,
          class_name = $3,
          subject = $4,
          duration_minutes = $5,
          instructions = $6,
          status = $7,
          total_questions = $8,
          scheduled_start_at = $9,
          scheduled_end_at = $10,
          updated_at = NOW()
        WHERE id = $11
        RETURNING *
      `,
      [
        examData.title,
        examData.exam_type,
        examData.class_name,
        examData.subject,
        examData.duration_minutes,
        examData.instructions,
        examData.status,
        examData.questions.length,
        examData.scheduled_start_at,
        examData.scheduled_end_at,
        id,
      ]
    );

    await client.query(
      `
        DELETE FROM school_exam_questions
        WHERE exam_id = $1
      `,
      [id]
    );

    await insertQuestions(
      client,
      id,
      examData.questions
    );

    const savedQuestions = await client.query(
      `
        SELECT *
        FROM school_exam_questions
        WHERE exam_id = $1
        ORDER BY question_order ASC, id ASC
      `,
      [id]
    );

    await client.query("COMMIT");

    return res.status(200).json({
      success: true,
      message: "School examination updated successfully.",
      exam: {
        ...updatedExamResult.rows[0],
        questions: savedQuestions.rows,
        question_count: savedQuestions.rows.length,
      },
    });
  } catch (error) {
    if (client) {
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        console.error(
          "SCHOOL EXAM UPDATE ROLLBACK ERROR:",
          rollbackError
        );
      }
    }

    console.error("SCHOOL EXAM UPDATE ERROR:", error);

    return res.status(500).json({
      success: false,
      error: "Unable to update school examination.",
      details:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  } finally {
    if (client) client.release();
  }
});

// ============================================================
// DELETE SCHOOL EXAMINATION
// DELETE /api/admin/school-exams/:id
// ============================================================

router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    await ensureTables();

    const { id } = req.params;

    if (!/^\d+$/.test(id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid examination ID.",
      });
    }

    const result = await pool.query(
      `
        DELETE FROM school_exams
        WHERE id = $1
        RETURNING id
      `,
      [id]
    );

    if (!result.rows.length) {
      return res.status(404).json({
        success: false,
        error: "School examination not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "School examination deleted successfully.",
      id: result.rows[0].id,
    });
  } catch (error) {
    console.error("SCHOOL EXAM DELETE ERROR:", error);

    return res.status(500).json({
      success: false,
      error: "Unable to delete school examination.",
      details:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
});

// ============================================================
// EXPORT
// ============================================================

export default router;