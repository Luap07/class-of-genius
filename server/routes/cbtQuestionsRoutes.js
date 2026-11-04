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
// ALLOWED DATABASE FIELDS
// ============================================================

const allowedFields = {
  exam: "exam",
  subject: "subject",
  question: "question",
  options: "options",
  answer: "answer",
  image: "image",
  reason: "reason",
  question_type: "question_type",
  passage_id: "passage_id",
  passage_title: "passage_title",
  passage: "passage",
  passage_order: "passage_order",
  optionA: '"optionA"',
  optionB: '"optionB"',
  optionC: '"optionC"',
  optionD: '"optionD"',
  active: "active",
  source_question_id: "source_question_id",
  generated_for: "generated_for",
  is_rephrased: "is_rephrased",
};

const editableFields = Object.keys(allowedFields);

// ============================================================
// VALUE NORMALIZATION
// ============================================================

const normalizeValue = (field, value) => {
  if (
    field === "options" &&
    value !== null &&
    typeof value === "object"
  ) {
    return JSON.stringify(value);
  }

  if (field === "active" || field === "is_rephrased") {
    if (value === "true" || value === 1) return true;
    if (value === "false" || value === 0) return false;

    return Boolean(value);
  }

  if (field === "passage_order") {
    if (
      value === "" ||
      value === null ||
      value === undefined
    ) {
      return null;
    }

    const number = Number(value);

    return Number.isFinite(number) ? number : null;
  }

  return value === undefined ? null : value;
};

// ============================================================
// BUILD QUESTION PAYLOAD
// ============================================================

const buildQuestionPayload = (body, partial = false) => {
  const payload = {};

  for (const field of editableFields) {
    if (
      !Object.prototype.hasOwnProperty.call(body, field)
    ) {
      continue;
    }

    payload[field] = normalizeValue(field, body[field]);
  }

  if (!partial) {
    payload.exam = String(payload.exam || "").trim();
    payload.subject = String(payload.subject || "").trim();
    payload.question = String(payload.question || "").trim();
    payload.answer = String(payload.answer || "").trim();

    if (!payload.question_type) {
      payload.question_type = payload.passage_id
        ? "comprehension"
        : "objective";
    }

    if (payload.active === undefined) {
      payload.active = true;
    }
  }

  return payload;
};

// ============================================================
// VALIDATION
// ============================================================

const validateQuestion = (payload) => {
  if (!payload.exam) {
    return "Exam is required.";
  }

  if (!payload.subject) {
    return "Subject is required.";
  }

  if (!payload.question) {
    return "Question text is required.";
  }

  if (!payload.answer) {
    return "Correct answer is required.";
  }

  if (
    payload.question_type &&
    !["objective", "comprehension"].includes(
      String(payload.question_type).toLowerCase()
    )
  ) {
    return "Question type must be objective or comprehension.";
  }

  return null;
};

// ============================================================
// GET ALL QUESTIONS
// GET /api/admin/cbt/questions
//
// IMPORTANT:
// NO LIMIT
// NO OFFSET
// RETURNS ALL MATCHING QUESTIONS
// ============================================================

router.get("/", requireAdmin, async (req, res) => {
  try {
    const search = String(
      req.query.search || ""
    ).trim();

    const exam = String(
      req.query.exam || ""
    ).trim();

    const subject = String(
      req.query.subject || ""
    ).trim();

    const type = String(
      req.query.type || ""
    ).trim().toLowerCase();

    const conditions = [];
    const values = [];

    // --------------------------------------------------------
    // EXAM FILTER
    // --------------------------------------------------------

    if (exam) {
      values.push(exam);

      conditions.push(
        `LOWER(TRIM(exam)) = LOWER(TRIM($${values.length}))`
      );
    }

    // --------------------------------------------------------
    // SUBJECT FILTER
    // --------------------------------------------------------

    if (subject) {
      values.push(subject);

      conditions.push(
        `LOWER(TRIM(subject)) = LOWER(TRIM($${values.length}))`
      );
    }

    // --------------------------------------------------------
    // OBJECTIVE FILTER
    // --------------------------------------------------------

    if (type === "objective") {
      conditions.push(`
        (
          LOWER(COALESCE(question_type, 'objective')) <> 'comprehension'
          AND passage_id IS NULL
        )
      `);
    }

    // --------------------------------------------------------
    // COMPREHENSION FILTER
    // --------------------------------------------------------

    if (type === "comprehension") {
      conditions.push(`
        (
          LOWER(COALESCE(question_type, '')) = 'comprehension'
          OR passage_id IS NOT NULL
        )
      `);
    }

    // --------------------------------------------------------
    // SEARCH FILTER
    // --------------------------------------------------------

    if (search) {
      values.push(`%${search}%`);

      const searchIndex = values.length;

      conditions.push(`
        (
          question ILIKE $${searchIndex}
          OR subject ILIKE $${searchIndex}
          OR exam ILIKE $${searchIndex}
          OR passage_title ILIKE $${searchIndex}
          OR passage ILIKE $${searchIndex}
        )
      `);
    }

    const whereClause = conditions.length
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

    // --------------------------------------------------------
    // FETCH ALL MATCHING QUESTIONS
    // --------------------------------------------------------

    const result = await pool.query(
      `
        SELECT
          id,
          exam,
          subject,
          question,
          options,
          answer,
          image,
          created_at,
          reason,
          question_type,
          passage_id,
          passage_title,
          passage,
          passage_order,
          "optionA",
          "optionB",
          "optionC",
          "optionD",
          active,
          source_question_id,
          generated_for,
          is_rephrased
        FROM cbt_questions
        ${whereClause}
        ORDER BY created_at DESC NULLS LAST
      `,
      values
    );

    // --------------------------------------------------------
    // RESPONSE
    // --------------------------------------------------------

    return res.status(200).json({
      success: true,
      questions: result.rows,
      count: result.rows.length,
      total: result.rows.length,
    });
  } catch (error) {
    console.error("CBT ADMIN FETCH ERROR:", error);

    return res.status(500).json({
      success: false,
      questions: [],
      error: "Unable to fetch CBT questions.",
      details:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
});

// ============================================================
// CREATE QUESTION
// POST /api/admin/cbt/questions
// ============================================================

router.post("/", requireAdmin, async (req, res) => {
  try {
    const payload = buildQuestionPayload(req.body || {});

    const validationError = validateQuestion(payload);

    if (validationError) {
      return res.status(400).json({
        success: false,
        error: validationError,
      });
    }

    const fields = Object.keys(payload);

    const columns = fields.map(
      (field) => allowedFields[field]
    );

    const placeholders = fields.map(
      (_, index) => `$${index + 1}`
    );

    const values = fields.map(
      (field) => payload[field]
    );

    const result = await pool.query(
      `
        INSERT INTO cbt_questions (${columns.join(", ")})
        VALUES (${placeholders.join(", ")})
        RETURNING *
      `,
      values
    );

    return res.status(201).json({
      success: true,
      message: "Question created successfully.",
      question: result.rows[0],
    });
  } catch (error) {
    console.error("CBT QUESTION CREATE ERROR:", error);

    return res.status(500).json({
      success: false,
      error: "Unable to create CBT question.",
      details:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
});

// ============================================================
// UPDATE QUESTION
// PATCH /api/admin/cbt/questions/:id
// ============================================================

router.patch("/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const payload = buildQuestionPayload(
      req.body || {},
      true
    );

    const fields = Object.keys(payload);

    if (!fields.length) {
      return res.status(400).json({
        success: false,
        error: "No valid question fields were supplied.",
      });
    }

    // --------------------------------------------------------
    // CLEAR PASSAGE DATA WHEN CHANGED TO OBJECTIVE
    // --------------------------------------------------------

    if (payload.question_type === "objective") {
      payload.passage_id = null;
      payload.passage_title = null;
      payload.passage = null;
      payload.passage_order = null;

      for (const field of [
        "passage_id",
        "passage_title",
        "passage",
        "passage_order",
      ]) {
        if (!fields.includes(field)) {
          fields.push(field);
        }
      }
    }

    const assignments = fields.map(
      (field, index) =>
        `${allowedFields[field]} = $${index + 1}`
    );

    const values = fields.map(
      (field) => payload[field]
    );

    values.push(id);

    const result = await pool.query(
      `
        UPDATE cbt_questions
        SET ${assignments.join(", ")}
        WHERE id = $${values.length}
        RETURNING *
      `,
      values
    );

    if (!result.rows.length) {
      return res.status(404).json({
        success: false,
        error: "Question not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Question updated successfully.",
      question: result.rows[0],
    });
  } catch (error) {
    console.error("CBT QUESTION UPDATE ERROR:", error);

    return res.status(500).json({
      success: false,
      error: "Unable to update CBT question.",
      details:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
});

// ============================================================
// DELETE QUESTION
// DELETE /api/admin/cbt/questions/:id
// ============================================================

router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `
        DELETE FROM cbt_questions
        WHERE id = $1
        RETURNING id
      `,
      [req.params.id]
    );

    if (!result.rows.length) {
      return res.status(404).json({
        success: false,
        error: "Question not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Question deleted successfully.",
      id: result.rows[0].id,
    });
  } catch (error) {
    console.error("CBT QUESTION DELETE ERROR:", error);

    return res.status(500).json({
      success: false,
      error: "Unable to delete CBT question.",
      details:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
});

// ============================================================
// TOGGLE QUESTION STATUS
// PATCH /api/admin/cbt/questions/:id/status
// ============================================================

router.patch("/:id/status", requireAdmin, async (req, res) => {
  try {
    const active = req.body?.active;

    if (typeof active !== "boolean") {
      return res.status(400).json({
        success: false,
        error: "A boolean active value is required.",
      });
    }

    const result = await pool.query(
      `
        UPDATE cbt_questions
        SET active = $1
        WHERE id = $2
        RETURNING *
      `,
      [active, req.params.id]
    );

    if (!result.rows.length) {
      return res.status(404).json({
        success: false,
        error: "Question not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: active
        ? "Question activated successfully."
        : "Question deactivated successfully.",
      question: result.rows[0],
    });
  } catch (error) {
    console.error("CBT QUESTION STATUS ERROR:", error);

    return res.status(500).json({
      success: false,
      error: "Unable to update question status.",
      details:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
});

export default router;