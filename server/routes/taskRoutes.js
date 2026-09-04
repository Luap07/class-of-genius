import express from "express";
import jwt from "jsonwebtoken";
import pool from "../lib/db.js";

const router = express.Router();

/* =========================================================
   AUTH
========================================================= */

const requireAdmin = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Authentication required.",
      });
    }

    const token = authHeader.slice(7);

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    if (decoded.role !== "admin") {
      return res.status(403).json({
        message: "Admin access required.",
      });
    }

    req.user = decoded;

    next();
  } catch (error) {
    console.error("Task auth error:", error);

    return res.status(401).json({
      message: "Invalid or expired authentication token.",
    });
  }
};

/* =========================================================
   USER AUTH
========================================================= */

const requireAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Authentication required.",
      });
    }

    const token = authHeader.slice(7);

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.user = decoded;

    next();
  } catch (error) {
    console.error("Task user auth error:", error);

    return res.status(401).json({
      message: "Invalid or expired authentication token.",
    });
  }
};

/* =========================================================
   TEST
========================================================= */

router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Task API is working.",
  });
});

/* =========================================================
   GET ALL TASKS
   Student Tasks.jsx
========================================================= */

router.get("/", requireAuth, async (req, res) => {
  try {
    const weeklyResult = await pool.query(`
      SELECT
        wt.id,
        wt.topic_id,
        wt.title,
        wt.description,
        wt.week,
        wt.due_date,
        wt.priority,
        wt.difficulty,
        wt.xp,
        wt.created_at,

        ct.title AS topic_title,
        ct.course_id,

        c.title AS course_title

      FROM weekly_tasks wt

      LEFT JOIN course_topics ct
        ON ct.id = wt.topic_id

      LEFT JOIN courses c
        ON c.id = ct.course_id

      ORDER BY wt.week ASC, wt.created_at ASC
    `);

    /*
      Monthly quizzes are included if the table exists.
      If you haven't migrated monthly_quizzes yet,
      we simply return an empty array.
    */

    let monthlyTasks = [];

    try {
      const monthlyResult = await pool.query(`
        SELECT
          mq.*,
          ct.title AS topic_title,
          ct.course_id,
          c.title AS course_title

        FROM monthly_quizzes mq

        LEFT JOIN course_topics ct
          ON ct.id = mq.topic_id

        LEFT JOIN courses c
          ON c.id = ct.course_id

        ORDER BY mq.quiz_number ASC
      `);

      monthlyTasks = monthlyResult.rows || [];
    } catch (monthlyError) {
      console.warn(
        "Monthly quizzes table/query unavailable:",
        monthlyError.message
      );

      monthlyTasks = [];
    }

    res.json({
      weeklyTasks: weeklyResult.rows || [],
      monthlyTasks,
    });
  } catch (error) {
    console.error("Get tasks error:", error);

    res.status(500).json({
      message: "Failed to load tasks.",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
});

/* =========================================================
   GET TASKS FOR A TOPIC
   Admin WeeklyTasksAdmin
========================================================= */

router.get(
  "/topic/:topicId",
  requireAdmin,
  async (req, res) => {
    try {
      const { topicId } = req.params;

      if (!topicId) {
        return res.status(400).json({
          message: "Topic ID is required.",
        });
      }

      const topicResult = await pool.query(
        `
        SELECT
          ct.id,
          ct.title,
          ct.course_id,
          c.title AS course_title

        FROM course_topics ct

        LEFT JOIN courses c
          ON c.id = ct.course_id

        WHERE ct.id = $1

        LIMIT 1
        `,
        [topicId]
      );

      if (topicResult.rows.length === 0) {
        return res.status(404).json({
          message: "Topic not found.",
        });
      }

      const tasksResult = await pool.query(
        `
        SELECT
          id,
          topic_id,
          title,
          description,
          week,
          due_date,
          priority,
          difficulty,
          xp,
          created_at

        FROM weekly_tasks

        WHERE topic_id = $1

        ORDER BY week ASC, created_at ASC
        `,
        [topicId]
      );

      res.json({
        topic: topicResult.rows[0],
        tasks: tasksResult.rows,
      });
    } catch (error) {
      console.error(
        "Get topic weekly tasks error:",
        error
      );

      res.status(500).json({
        message: "Failed to load weekly tasks.",
      });
    }
  }
);

/* =========================================================
   GET SINGLE TASK
========================================================= */

router.get(
  "/:id",
  requireAuth,
  async (req, res) => {
    try {
      const { id } = req.params;

      const result = await pool.query(
        `
        SELECT
          wt.*,

          ct.title AS topic_title,
          ct.course_id,

          c.title AS course_title

        FROM weekly_tasks wt

        LEFT JOIN course_topics ct
          ON ct.id = wt.topic_id

        LEFT JOIN courses c
          ON c.id = ct.course_id

        WHERE wt.id = $1

        LIMIT 1
        `,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          message: "Task not found.",
        });
      }

      res.json({
        task: result.rows[0],
      });
    } catch (error) {
      console.error("Get task error:", error);

      res.status(500).json({
        message: "Failed to load task.",
      });
    }
  }
);

/* =========================================================
   CREATE WEEKLY TASK
========================================================= */

router.post(
  "/",
  requireAdmin,
  async (req, res) => {
    try {
      const {
        topic_id,
        title,
        description,
        week,
        due_date,
        priority,
        difficulty,
        xp,
      } = req.body;

      if (!topic_id) {
        return res.status(400).json({
          message: "Topic ID is required.",
        });
      }

      if (!title || !String(title).trim()) {
        return res.status(400).json({
          message: "Task title is required.",
        });
      }

      const result = await pool.query(
        `
        INSERT INTO weekly_tasks (
          topic_id,
          title,
          description,
          week,
          due_date,
          priority,
          difficulty,
          xp
        )

        VALUES (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          $7,
          $8
        )

        RETURNING *
        `,
        [
          topic_id,
          String(title).trim(),
          description || null,
          Number(week) || 1,
          due_date || null,
          priority || "medium",
          difficulty || "medium",
          Number(xp) || 0,
        ]
      );

      res.status(201).json({
        message: "Weekly task created successfully.",
        task: result.rows[0],
      });
    } catch (error) {
      console.error("Create task error:", error);

      res.status(500).json({
        message: "Failed to create weekly task.",
      });
    }
  }
);

/* =========================================================
   UPDATE WEEKLY TASK
========================================================= */

router.put(
  "/:id",
  requireAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;

      const {
        topic_id,
        title,
        description,
        week,
        due_date,
        priority,
        difficulty,
        xp,
      } = req.body;

      if (!title || !String(title).trim()) {
        return res.status(400).json({
          message: "Task title is required.",
        });
      }

      const result = await pool.query(
        `
        UPDATE weekly_tasks

        SET
          topic_id = COALESCE($1, topic_id),
          title = $2,
          description = $3,
          week = COALESCE($4, week),
          due_date = $5,
          priority = COALESCE($6, priority),
          difficulty = COALESCE($7, difficulty),
          xp = COALESCE($8, xp)

        WHERE id = $9

        RETURNING *
        `,
        [
          topic_id || null,
          String(title).trim(),
          description || null,
          week !== undefined && week !== ""
            ? Number(week)
            : null,
          due_date || null,
          priority || null,
          difficulty || null,
          xp !== undefined && xp !== ""
            ? Number(xp)
            : null,
          id,
        ]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          message: "Task not found.",
        });
      }

      res.json({
        message: "Weekly task updated successfully.",
        task: result.rows[0],
      });
    } catch (error) {
      console.error("Update task error:", error);

      res.status(500).json({
        message: "Failed to update weekly task.",
      });
    }
  }
);

/* =========================================================
   DELETE WEEKLY TASK
========================================================= */

router.delete(
  "/:id",
  requireAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;

      const result = await pool.query(
        `
        DELETE FROM weekly_tasks

        WHERE id = $1

        RETURNING id
        `,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          message: "Task not found.",
        });
      }

      res.json({
        success: true,
        message: "Weekly task deleted successfully.",
        id: result.rows[0].id,
      });
    } catch (error) {
      console.error("Delete task error:", error);

      res.status(500).json({
        message: "Unable to delete weekly task.",
      });
    }
  }
);

export default router;