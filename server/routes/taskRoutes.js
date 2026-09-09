import express from "express";
import jwt from "jsonwebtoken";
import pool from "../lib/db.js";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

/* =========================================================
   TASK UPLOAD DIRECTORY
========================================================= */

const uploadDirectory = path.resolve(
  process.cwd(),
  "uploads",
  "tasks"
);

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, {
    recursive: true,
  });
}

/* =========================================================
   ALLOWED FILE TYPES
========================================================= */

const ALLOWED_MIME_TYPES = new Set([
  // Documents
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

  // Presentations
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",

  // Spreadsheets
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

  // Text
  "text/plain",
  "text/csv",

  // Images
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",

  // Audio
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/ogg",
  "audio/webm",

  // Video
  "video/mp4",
  "video/webm",
  "video/ogg",
  "video/quicktime",

  // Archives
  "application/zip",
  "application/x-zip-compressed",
]);

/* =========================================================
   FILE EXTENSIONS
========================================================= */

const ALLOWED_EXTENSIONS = new Set([
  ".pdf",
  ".doc",
  ".docx",
  ".ppt",
  ".pptx",
  ".xls",
  ".xlsx",
  ".txt",
  ".csv",
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".mp3",
  ".wav",
  ".ogg",
  ".webm",
  ".mp4",
  ".mov",
  ".zip",
]);

/* =========================================================
   FILE SIZE
   100 MB PER FILE
========================================================= */

const MAX_FILE_SIZE = 100 * 1024 * 1024;

/* =========================================================
   MULTER STORAGE
========================================================= */

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },

  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname);

    const baseName = path
      .basename(file.originalname, extension)
      .replace(/[^a-zA-Z0-9-_]/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 80);

    const uniqueName = `${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}-${baseName}${extension.toLowerCase()}`;

    cb(null, uniqueName);
  },
});

/* =========================================================
   MULTER FILTER
========================================================= */

const fileFilter = (req, file, cb) => {
  const extension = path
    .extname(file.originalname)
    .toLowerCase();

  const validMimeType = ALLOWED_MIME_TYPES.has(
    file.mimetype
  );

  const validExtension =
    ALLOWED_EXTENSIONS.has(extension);

  if (!validMimeType && !validExtension) {
    return cb(
      new Error(
        `File type not supported: ${file.originalname}`
      )
    );
  }

  cb(null, true);
};

/* =========================================================
   UPLOAD MIDDLEWARE
========================================================= */

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 10,
  },
});

/* =========================================================
   FILE HELPERS
========================================================= */

function buildAttachment(file) {
  if (!file) return null;

  return {
    name: file.originalname,
    filename: file.filename,
    url: `/uploads/tasks/${encodeURIComponent(
      file.filename
    )}`,
    type: file.mimetype,
    size: file.size,
  };
}

function parseAttachments(value) {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);

      return Array.isArray(parsed)
        ? parsed
        : [];
    } catch {
      return [];
    }
  }

  return [];
}

function deleteUploadedFile(attachment) {
  if (!attachment) return;

  const filename = attachment.filename;

  if (!filename) return;

  const filePath = path.join(
    uploadDirectory,
    path.basename(filename)
  );

  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.warn(
      "Could not delete uploaded task file:",
      error.message
    );
  }
}

function deleteUploadedFiles(attachments = []) {
  for (const attachment of attachments) {
    deleteUploadedFile(attachment);
  }
}

/* =========================================================
   AUTH
========================================================= */

const requireAdmin = (req, res, next) => {
  try {
    const authHeader =
      req.headers.authorization || "";

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
      message:
        "Invalid or expired authentication token.",
    });
  }
};

/* =========================================================
   USER AUTH
========================================================= */

const requireAuth = (req, res, next) => {
  try {
    const authHeader =
      req.headers.authorization || "";

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
    console.error(
      "Task user auth error:",
      error
    );

    return res.status(401).json({
      message:
        "Invalid or expired authentication token.",
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
        wt.attachments,
        wt.created_at,

        ct.title AS topic_title,
        ct.course_id,

        c.title AS course_title

      FROM weekly_tasks wt

      LEFT JOIN course_topics ct
        ON ct.id = wt.topic_id

      LEFT JOIN courses c
        ON c.id = ct.course_id

      ORDER BY
        wt.week ASC,
        wt.created_at ASC
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

      monthlyTasks =
        monthlyResult.rows || [];
    } catch (monthlyError) {
      console.warn(
        "Monthly quizzes table/query unavailable:",
        monthlyError.message
      );

      monthlyTasks = [];
    }

    res.json({
      weeklyTasks:
        weeklyResult.rows || [],
      monthlyTasks,
    });
  } catch (error) {
    console.error(
      "Get tasks error:",
      error
    );

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
          attachments,
          created_at

        FROM weekly_tasks

        WHERE topic_id = $1

        ORDER BY
          week ASC,
          created_at ASC
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
        message:
          "Failed to load weekly tasks.",
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
      console.error(
        "Get task error:",
        error
      );

      res.status(500).json({
        message: "Failed to load task.",
      });
    }
  }
);

/* =========================================================
   CREATE WEEKLY TASK
   Supports multipart/form-data + attachments
========================================================= */

router.post(
  "/",
  requireAdmin,
  upload.array("attachments", 10),
  async (req, res) => {
    const uploadedFiles =
      req.files || [];

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
        deleteUploadedFiles(
          uploadedFiles.map(buildAttachment)
        );

        return res.status(400).json({
          message: "Topic ID is required.",
        });
      }

      if (
        !title ||
        !String(title).trim()
      ) {
        deleteUploadedFiles(
          uploadedFiles.map(buildAttachment)
        );

        return res.status(400).json({
          message:
            "Task title is required.",
        });
      }

      const attachments =
        uploadedFiles.map(
          buildAttachment
        );

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
          xp,
          attachments
        )

        VALUES (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          $7,
          $8,
          $9::jsonb
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
          JSON.stringify(attachments),
        ]
      );

      res.status(201).json({
        message:
          "Weekly task created successfully.",
        task: result.rows[0],
      });
    } catch (error) {
      console.error(
        "Create task error:",
        error
      );

      /*
        If database insertion fails,
        remove the files that were just uploaded.
      */

      deleteUploadedFiles(
        uploadedFiles.map(
          buildAttachment
        )
      );

      res.status(500).json({
        message:
          "Failed to create weekly task.",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : undefined,
      });
    }
  }
);

/* =========================================================
   UPDATE WEEKLY TASK
   Supports replacing / adding attachments
========================================================= */

router.put(
  "/:id",
  requireAdmin,
  upload.array("attachments", 10),
  async (req, res) => {
    const uploadedFiles =
      req.files || [];

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

      if (
        !title ||
        !String(title).trim()
      ) {
        deleteUploadedFiles(
          uploadedFiles.map(
            buildAttachment
          )
        );

        return res.status(400).json({
          message:
            "Task title is required.",
        });
      }

      /*
        Get the existing task first so we can
        preserve its attachments if no new
        attachment operation was requested.
      */

      const existingResult =
        await pool.query(
          `
          SELECT
            id,
            attachments

          FROM weekly_tasks

          WHERE id = $1

          LIMIT 1
          `,
          [id]
        );

      if (
        existingResult.rows.length === 0
      ) {
        deleteUploadedFiles(
          uploadedFiles.map(
            buildAttachment
          )
        );

        return res.status(404).json({
          message: "Task not found.",
        });
      }

      const existingTask =
        existingResult.rows[0];

      const existingAttachments =
        parseAttachments(
          existingTask.attachments
        );

      /*
        New attachments are added to
        existing attachments.

        If the frontend sends:
          remove_attachments
        those matching files are removed.
      */

      let attachments =
        [...existingAttachments];

      const removeAttachments =
        parseAttachments(
          req.body.remove_attachments
        );

      if (
        removeAttachments.length > 0
      ) {
        const removeNames =
          new Set(
            removeAttachments
              .map(
                (item) =>
                  item.filename ||
                  item.name ||
                  item.url
              )
              .filter(Boolean)
          );

        const removedFiles =
          attachments.filter(
            (item) =>
              removeNames.has(
                item.filename
              ) ||
              removeNames.has(
                item.name
              ) ||
              removeNames.has(
                item.url
              )
          );

        deleteUploadedFiles(
          removedFiles
        );

        attachments =
          attachments.filter(
            (item) =>
              !(
                removeNames.has(
                  item.filename
                ) ||
                removeNames.has(
                  item.name
                ) ||
                removeNames.has(
                  item.url
                )
              )
          );
      }

      /*
        Add newly uploaded files.
      */

      const newAttachments =
        uploadedFiles.map(
          buildAttachment
        );

      attachments = [
        ...attachments,
        ...newAttachments,
      ];

      /*
        Optional complete replacement.

        If the frontend sends:
          replace_attachments=true

        the existing attachments are
        removed and only newly uploaded
        files remain.
      */

      const replaceAttachments =
        String(
          req.body.replace_attachments ||
            ""
        ).toLowerCase() === "true";

      if (replaceAttachments) {
        deleteUploadedFiles(
          existingAttachments
        );

        attachments =
          newAttachments;
      }

      const result =
        await pool.query(
          `
          UPDATE weekly_tasks

          SET
            topic_id =
              COALESCE($1, topic_id),

            title = $2,

            description = $3,

            week =
              COALESCE($4, week),

            due_date = $5,

            priority =
              COALESCE($6, priority),

            difficulty =
              COALESCE($7, difficulty),

            xp =
              COALESCE($8, xp),

            attachments =
              $9::jsonb

          WHERE id = $10

          RETURNING *
          `,
          [
            topic_id || null,
            String(title).trim(),
            description || null,

            week !== undefined &&
            week !== ""
              ? Number(week)
              : null,

            due_date || null,

            priority || null,

            difficulty || null,

            xp !== undefined &&
            xp !== ""
              ? Number(xp)
              : null,

            JSON.stringify(
              attachments
            ),

            id,
          ]
        );

      res.json({
        message:
          "Weekly task updated successfully.",
        task: result.rows[0],
      });
    } catch (error) {
      console.error(
        "Update task error:",
        error
      );

      /*
        New files are deleted if the
        update fails.
      */

      deleteUploadedFiles(
        uploadedFiles.map(
          buildAttachment
        )
      );

      res.status(500).json({
        message:
          "Failed to update weekly task.",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : undefined,
      });
    }
  }
);

/* =========================================================
   DELETE WEEKLY TASK
   Also deletes its uploaded files
========================================================= */

router.delete(
  "/:id",
  requireAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;

      /*
        Get attachments before deleting
        the database record.
      */

      const existingResult =
        await pool.query(
          `
          SELECT
            id,
            attachments

          FROM weekly_tasks

          WHERE id = $1

          LIMIT 1
          `,
          [id]
        );

      if (
        existingResult.rows.length === 0
      ) {
        return res.status(404).json({
          message: "Task not found.",
        });
      }

      const attachments =
        parseAttachments(
          existingResult.rows[0]
            .attachments
        );

      const result =
        await pool.query(
          `
          DELETE FROM weekly_tasks

          WHERE id = $1

          RETURNING id
          `,
          [id]
        );

      /*
        Remove physical files after
        successful database deletion.
      */

      deleteUploadedFiles(
        attachments
      );

      res.json({
        success: true,
        message:
          "Weekly task deleted successfully.",
        id: result.rows[0].id,
      });
    } catch (error) {
      console.error(
        "Delete task error:",
        error
      );

      res.status(500).json({
        message:
          "Unable to delete weekly task.",
      });
    }
  }
);

/* =========================================================
   MULTER ERROR HANDLER
========================================================= */

router.use(
  (error, req, res, next) => {
    if (
      error instanceof
      multer.MulterError
    ) {
      if (
        error.code ===
        "LIMIT_FILE_SIZE"
      ) {
        return res.status(400).json({
          message:
            "A file is too large. Maximum size is 100 MB per file.",
        });
      }

      if (
        error.code ===
        "LIMIT_FILE_COUNT"
      ) {
        return res.status(400).json({
          message:
            "You can upload a maximum of 10 files per task.",
        });
      }

      return res.status(400).json({
        message:
          error.message ||
          "File upload error.",
      });
    }

    if (error) {
      console.error(
        "Task file upload error:",
        error
      );

      return res.status(400).json({
        message:
          error.message ||
          "Unable to upload task file.",
      });
    }

    next();
  }
);

export default router;