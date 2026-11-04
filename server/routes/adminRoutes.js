
import express from "express";
import jwt from "jsonwebtoken";
import pool from "../lib/db.js";

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;

// =========================================================
// ADMIN AUTH CHECK
// =========================================================

const requireAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";

    const cookieToken =
      req.cookies?.scholiqen_auth_token ||
      req.cookies?.token ||
      req.cookies?.access_token;

    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : cookieToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (!JWT_SECRET) {
      console.error("JWT_SECRET is not configured.");

      return res.status(500).json({
        success: false,
        message: "Authentication configuration is missing.",
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    if (!decoded?.id) {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token.",
      });
    }

    const result = await pool.query(
      `
        SELECT
          id,
          username,
          email,
          role,
          created_at
        FROM users
        WHERE id = $1
        LIMIT 1
      `,
      [decoded.id]
    );

    if (!result.rows.length) {
      return res.status(401).json({
        success: false,
        message: "User account not found.",
      });
    }

    const user = result.rows[0];

    if (String(user.role).toLowerCase() !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required.",
      });
    }

    req.user = user;

    next();
  } catch (error) {
    console.error("Admin authentication error:", error);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired authentication token.",
    });
  }
};

// =========================================================
// CBT QUESTION HELPERS
// =========================================================

const normalizeQuestionPayload = (body = {}) => {
  let options = body.options;

  if (typeof options === "string") {
    try {
      options = JSON.parse(options);
    } catch {
      options = [];
    }
  }

  if (!Array.isArray(options)) {
    options = [];
  }

  const optionA =
    body.optionA ?? options[0] ?? null;

  const optionB =
    body.optionB ?? options[1] ?? null;

  const optionC =
    body.optionC ?? options[2] ?? null;

  const optionD =
    body.optionD ?? options[3] ?? null;

  const passageOrder = Number(body.passage_order ?? 0);

  return {
    exam: String(body.exam || "").trim(),
    subject: String(body.subject || "").trim(),
    question: String(body.question || "").trim(),
    options,
    answer: String(body.answer || "").trim(),
    image: body.image ? String(body.image).trim() : null,
    reason: body.reason ? String(body.reason) : null,
    question_type: body.question_type
      ? String(body.question_type).trim()
      : "objective",
    passage_id: body.passage_id
      ? String(body.passage_id).trim()
      : null,
    passage_title: body.passage_title
      ? String(body.passage_title).trim()
      : null,
    passage: body.passage ? String(body.passage) : null,
    passage_order: Number.isFinite(passageOrder)
      ? passageOrder
      : 0,
    optionA: optionA == null ? null : String(optionA),
    optionB: optionB == null ? null : String(optionB),
    optionC: optionC == null ? null : String(optionC),
    optionD: optionD == null ? null : String(optionD),
    active: body.active === undefined
      ? true
      : body.active === true || body.active === "true",
  };
};

const validateQuestionPayload = (question) => {
  if (!question.exam) {
    return "Exam is required.";
  }

  if (!question.subject) {
    return "Subject is required.";
  }

  if (!question.question) {
    return "Question text is required.";
  }

  if (
    !Array.isArray(question.options) ||
    question.options.length < 2
  ) {
    return "At least two answer options are required.";
  }

  const validOptions = question.options.filter((option) => {
    if (option === null || option === undefined) {
      return false;
    }

    if (typeof option === "object") {
      return Boolean(
        String(
          option.text ??
          option.value ??
          option.content ??
          ""
        ).trim()
      );
    }

    return Boolean(String(option).trim());
  });

  if (validOptions.length < 2) {
    return "At least two non-empty answer options are required.";
  }

  if (!question.answer) {
    return "Correct answer is required.";
  }

  return null;
};

const isValidUUID = (value) => {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    String(value || "")
  );
};

// =========================================================
// SAFE COUNT
// =========================================================

const getCount = async (table) => {
  const allowedTables = [
    "users",
    "courses",
    "virtual_labs",
    "cbt_questions",
    "novels",
  ];

  if (!allowedTables.includes(table)) {
    return 0;
  }

  try {
    const result = await pool.query(
      `SELECT COUNT(*)::int AS count FROM ${table}`
    );

    return Number(result.rows[0]?.count || 0);
  } catch (error) {
    console.error(`Error counting ${table}:`, error);
    return 0;
  }
};

// =========================================================
// COUNT CREATED SINCE DATE
// =========================================================

const getCountSince = async (table, date) => {
  const allowedTables = [
    "users",
    "courses",
    "virtual_labs",
    "cbt_questions",
    "novels",
  ];

  if (!allowedTables.includes(table)) {
    return 0;
  }

  try {
    const result = await pool.query(
      `
        SELECT COUNT(*)::int AS count
        FROM ${table}
        WHERE created_at >= $1
      `,
      [date]
    );

    return Number(result.rows[0]?.count || 0);
  } catch (error) {
    console.error(
      `Error calculating growth for ${table}:`,
      error
    );

    return 0;
  }
};

// =========================================================
// CBT QUESTIONS
// All routes below use Neon PostgreSQL.
// =========================================================

// GET /api/admin/cbt/questions

router.get(
  "/cbt/questions",
  requireAdmin,
  async (req, res) => {
    try {
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
          ORDER BY created_at DESC NULLS LAST
        `
      );

      return res.json({
        success: true,
        questions: result.rows,
        count: result.rows.length,
      });
    } catch (error) {
      console.error("Fetch CBT questions error:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to fetch CBT questions.",
        questions: [],
      });
    }
  }
);

// POST /api/admin/cbt/questions

router.post(
  "/cbt/questions",
  requireAdmin,
  async (req, res) => {
    try {
      const question = normalizeQuestionPayload(req.body);

      const validationError =
        validateQuestionPayload(question);

      if (validationError) {
        return res.status(400).json({
          success: false,
          message: validationError,
        });
      }

      const result = await pool.query(
        `
          INSERT INTO cbt_questions (
            exam,
            subject,
            question,
            options,
            answer,
            image,
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
            active
          )
          VALUES (
            $1,
            $2,
            $3,
            $4::jsonb,
            $5,
            $6,
            $7,
            $8,
            $9,
            $10,
            $11,
            $12,
            $13,
            $14,
            $15,
            $16,
            $17
          )
          RETURNING *
        `,
        [
          question.exam,
          question.subject,
          question.question,
          JSON.stringify(question.options),
          question.answer,
          question.image,
          question.reason,
          question.question_type,
          question.passage_id,
          question.passage_title,
          question.passage,
          question.passage_order,
          question.optionA,
          question.optionB,
          question.optionC,
          question.optionD,
          question.active,
        ]
      );

      return res.status(201).json({
        success: true,
        message: "Question created successfully.",
        question: result.rows[0],
      });
    } catch (error) {
      console.error("Create CBT question error:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to create CBT question.",
      });
    }
  }
);

// PATCH /api/admin/cbt/questions/:id

router.patch(
  "/cbt/questions/:id",
  requireAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!isValidUUID(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid question ID.",
        });
      }

      const question = normalizeQuestionPayload(req.body);

      const validationError =
        validateQuestionPayload(question);

      if (validationError) {
        return res.status(400).json({
          success: false,
          message: validationError,
        });
      }

      const result = await pool.query(
        `
          UPDATE cbt_questions
          SET
            exam = $1,
            subject = $2,
            question = $3,
            options = $4::jsonb,
            answer = $5,
            image = $6,
            reason = $7,
            question_type = $8,
            passage_id = $9,
            passage_title = $10,
            passage = $11,
            passage_order = $12,
            "optionA" = $13,
            "optionB" = $14,
            "optionC" = $15,
            "optionD" = $16,
            active = $17
          WHERE id = $18
          RETURNING *
        `,
        [
          question.exam,
          question.subject,
          question.question,
          JSON.stringify(question.options),
          question.answer,
          question.image,
          question.reason,
          question.question_type,
          question.passage_id,
          question.passage_title,
          question.passage,
          question.passage_order,
          question.optionA,
          question.optionB,
          question.optionC,
          question.optionD,
          question.active,
          id,
        ]
      );

      if (!result.rows.length) {
        return res.status(404).json({
          success: false,
          message: "Question not found.",
        });
      }

      return res.json({
        success: true,
        message: "Question updated successfully.",
        question: result.rows[0],
      });
    } catch (error) {
      console.error("Update CBT question error:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to update CBT question.",
      });
    }
  }
);

// PATCH /api/admin/cbt/questions/:id/status

router.patch(
  "/cbt/questions/:id/status",
  requireAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!isValidUUID(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid question ID.",
        });
      }

      const active =
        req.body?.active === true ||
        req.body?.active === "true";

      const result = await pool.query(
        `
          UPDATE cbt_questions
          SET active = $1
          WHERE id = $2
          RETURNING *
        `,
        [active, id]
      );

      if (!result.rows.length) {
        return res.status(404).json({
          success: false,
          message: "Question not found.",
        });
      }

      return res.json({
        success: true,
        message: active
          ? "Question activated successfully."
          : "Question deactivated successfully.",
        question: result.rows[0],
      });
    } catch (error) {
      console.error("Toggle CBT question status error:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to update question status.",
      });
    }
  }
);

// DELETE /api/admin/cbt/questions/:id

router.delete(
  "/cbt/questions/:id",
  requireAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!isValidUUID(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid question ID.",
        });
      }

      const result = await pool.query(
        `
          DELETE FROM cbt_questions
          WHERE id = $1
          RETURNING id
        `,
        [id]
      );

      if (!result.rows.length) {
        return res.status(404).json({
          success: false,
          message: "Question not found.",
        });
      }

      return res.json({
        success: true,
        message: "Question deleted successfully.",
        id: result.rows[0].id,
      });
    } catch (error) {
      console.error("Delete CBT question error:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to delete CBT question.",
      });
    }
  }
);

// =========================================================
// GENERAL ADMIN DASHBOARD
// GET /api/admin/dashboard
// =========================================================

router.get(
  "/dashboard",
  requireAdmin,
  async (req, res) => {
    try {
      const thirtyDaysAgo = new Date();

      thirtyDaysAgo.setDate(
        thirtyDaysAgo.getDate() - 30
      );

      const [
        usersCount,
        coursesCount,
        labsCount,
        questionsCount,
        novelsCount,
      ] = await Promise.all([
        getCount("users"),
        getCount("courses"),
        getCount("virtual_labs"),
        getCount("cbt_questions"),
        getCount("novels"),
      ]);

      const [
        usersGrowth,
        coursesGrowth,
        labsGrowth,
        questionsGrowth,
        novelsGrowth,
      ] = await Promise.all([
        getCountSince("users", thirtyDaysAgo),
        getCountSince("courses", thirtyDaysAgo),
        getCountSince("virtual_labs", thirtyDaysAgo),
        getCountSince("cbt_questions", thirtyDaysAgo),
        getCountSince("novels", thirtyDaysAgo),
      ]);

      const overallGrowth =
        usersGrowth +
        coursesGrowth +
        labsGrowth +
        questionsGrowth +
        novelsGrowth;

      let recentNovels = [];
      let recentCourses = [];
      let recentQuestions = [];

      try {
        const result = await pool.query(
          `
            SELECT id, title, created_at
            FROM novels
            ORDER BY created_at DESC
            LIMIT 3
          `
        );

        recentNovels = result.rows;
      } catch (error) {
        console.error("Recent novels error:", error);
      }

      try {
        const result = await pool.query(
          `
            SELECT id, title, created_at
            FROM courses
            ORDER BY created_at DESC
            LIMIT 3
          `
        );

        recentCourses = result.rows;
      } catch (error) {
        console.error("Recent courses error:", error);
      }

      try {
        const result = await pool.query(
          `
            SELECT id, created_at
            FROM cbt_questions
            ORDER BY created_at DESC
            LIMIT 3
          `
        );

        recentQuestions = result.rows;
      } catch (error) {
        console.error("Recent CBT questions error:", error);
      }

      return res.json({
        success: true,

        stats: {
          users: usersCount,
          courses: coursesCount,
          labs: labsCount,
          questions: questionsCount,
          novels: novelsCount,
        },

        growth: {
          users: usersGrowth,
          courses: coursesGrowth,
          labs: labsGrowth,
          questions: questionsGrowth,
          novels: novelsGrowth,
          overall: overallGrowth,
        },

        recent: {
          novels: recentNovels,
          courses: recentCourses,
          questions: recentQuestions,
        },
      });
    } catch (error) {
      console.error("Admin dashboard error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to load admin dashboard.",
      });
    }
  }
);

// =========================================================
// CBT ADMIN DASHBOARD
// GET /api/admin/cbt/dashboard
// =========================================================

router.get(
  "/cbt/dashboard",
  requireAdmin,
  async (req, res) => {
    try {
      const questionCountResult = await pool.query(
        `
          SELECT COUNT(*)::int AS count
          FROM cbt_questions
        `
      );

      const questionCount = Number(
        questionCountResult.rows[0]?.count || 0
      );

      const questionRowsResult = await pool.query(
        `
          SELECT
            COALESCE(NULLIF(TRIM(subject), ''), 'Unknown') AS subject,
            COALESCE(NULLIF(TRIM(exam), ''), 'Unspecified') AS exam,
            COUNT(*)::int AS "questionCount"
          FROM cbt_questions
          GROUP BY
            COALESCE(NULLIF(TRIM(subject), ''), 'Unknown'),
            COALESCE(NULLIF(TRIM(exam), ''), 'Unspecified')
          ORDER BY subject ASC, exam ASC
        `
      );

      const questionRows = questionRowsResult.rows;

      const examCountResult = await pool.query(
        `
          SELECT COUNT(
            DISTINCT NULLIF(TRIM(exam), '')
          )::int AS count
          FROM cbt_questions
        `
      );

      const examCount = Number(
        examCountResult.rows[0]?.count || 0
      );

      let attemptsCount = 0;

      try {
        const tableResult = await pool.query(
          `
            SELECT to_regclass(
              'public.academy_cbt_attempts'
            ) AS table_name
          `
        );

        if (tableResult.rows[0]?.table_name) {
          const attemptsResult = await pool.query(
            `
              SELECT COUNT(*)::int AS count
              FROM academy_cbt_attempts
            `
          );

          attemptsCount = Number(
            attemptsResult.rows[0]?.count || 0
          );
        }
      } catch (error) {
        console.error(
          "CBT attempts count error:",
          error
        );
      }

      return res.json({
        success: true,
        questionRows,
        questionCount,
        examCount,
        attemptsCount,
      });
    } catch (error) {
      console.error(
        "CBT admin dashboard error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Unable to load CBT dashboard.",
        questionRows: [],
        questionCount: 0,
        examCount: 0,
        attemptsCount: 0,
      });
    }
  }
);

// =========================================================
// DELETE CBT SUBJECT
// DELETE /api/admin/cbt/subjects
// =========================================================

router.delete(
  "/cbt/subjects",
  requireAdmin,
  async (req, res) => {
    try {
      const subject = String(
        req.body?.subject || ""
      ).trim();

      const suppliedSubjects = Array.isArray(
        req.body?.rawSubjects
      )
        ? req.body.rawSubjects
        : [];

      const rawSubjects = [
        ...new Set(
          suppliedSubjects
            .map((value) => String(value || "").trim())
            .filter(Boolean)
        ),
      ];

      if (!rawSubjects.length && subject) {
        rawSubjects.push(subject);
      }

      if (!subject || !rawSubjects.length) {
        return res.status(400).json({
          success: false,
          message: "A valid CBT subject is required.",
        });
      }

      const result = await pool.query(
        `
          DELETE FROM cbt_questions
          WHERE subject = ANY($1::text[])
          RETURNING id
        `,
        [rawSubjects]
      );

      const deletedCount = result.rowCount || 0;

      return res.json({
        success: true,

        message: deletedCount
          ? `${deletedCount} question(s) deleted successfully.`
          : "No questions were found for this subject.",

        subject,
        deletedCount,
      });
    } catch (error) {
      console.error(
        "CBT subject deletion error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Unable to delete CBT subject.",
      });
    }
  }
);

export default router;
