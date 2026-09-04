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
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Authentication required.",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "Authentication token missing.",
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    if (!decoded?.id) {
      return res.status(401).json({
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

    if (result.rows.length === 0) {
      return res.status(401).json({
        message: "User account not found.",
      });
    }

    const user = result.rows[0];

    if (user.role !== "admin") {
      return res.status(403).json({
        message: "Admin access required.",
      });
    }

    req.user = user;

    next();
  } catch (error) {
    console.error("Admin authentication error:", error);

    return res.status(401).json({
      message: "Invalid or expired authentication token.",
    });
  }
};

// =========================================================
// SAFE COUNT
// =========================================================

const getCount = async (table) => {
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
// ADMIN DASHBOARD
// =========================================================

router.get("/dashboard", requireAdmin, async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();

    thirtyDaysAgo.setDate(
      thirtyDaysAgo.getDate() - 30
    );

    // =====================================================
    // LIVE COUNTS
    // =====================================================

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

    // =====================================================
    // GROWTH
    // =====================================================

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

    // =====================================================
    // RECENT NOVELS
    // =====================================================

    let recentNovels = [];

    try {
      const result = await pool.query(
        `
        SELECT
          id,
          title,
          created_at
        FROM novels
        ORDER BY created_at DESC
        LIMIT 3
        `
      );

      recentNovels = result.rows;
    } catch (error) {
      console.error(
        "Error fetching recent novels:",
        error
      );
    }

    // =====================================================
    // RECENT COURSES
    // =====================================================

    let recentCourses = [];

    try {
      const result = await pool.query(
        `
        SELECT
          id,
          title,
          created_at
        FROM courses
        ORDER BY created_at DESC
        LIMIT 3
        `
      );

      recentCourses = result.rows;
    } catch (error) {
      console.error(
        "Error fetching recent courses:",
        error
      );
    }

    // =====================================================
    // RECENT CBT QUESTIONS
    // =====================================================

    let recentQuestions = [];

    try {
      const result = await pool.query(
        `
        SELECT
          id,
          created_at
        FROM cbt_questions
        ORDER BY created_at DESC
        LIMIT 3
        `
      );

      recentQuestions = result.rows;
    } catch (error) {
      console.error(
        "Error fetching recent CBT questions:",
        error
      );
    }

    // =====================================================
    // RESPONSE
    // =====================================================

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
    console.error(
      "Admin dashboard error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to load admin dashboard.",
    });
  }
});

export default router;