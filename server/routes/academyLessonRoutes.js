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
  "video/mp4",
  "video/webm",
  "video/quicktime",
]);

/* =========================================================
   UPLOAD DIRECTORY
========================================================= */

const uploadDirectory = path.resolve(
  process.cwd(),
  "uploads",
  "academy-lessons"
);

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, {
    recursive: true,
  });
}

/* =========================================================
   MULTER
========================================================= */

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDirectory);
  },

  filename: (_req, file, cb) => {
    const extension = path.extname(file.originalname);

    const safeName = crypto
      .randomBytes(16)
      .toString("hex");

    cb(
      null,
      `${Date.now()}-${safeName}${extension}`
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
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      return cb(
        new Error(
          "Unsupported file type. PDF, DOC, DOCX, images and videos are allowed."
        )
      );
    }

    cb(null, true);
  },
});

/* =========================================================
   HELPERS
========================================================= */

const clean = (value) => {
  if (
    value === undefined ||
    value === null
  ) {
    return "";
  }

  return String(value).trim();
};

const getTutorReference = (req) => {
  return clean(
    req.query.reference ||
      req.query.tutorReference ||
      req.query.tutor_reference ||
      req.body?.reference ||
      req.body?.tutorReference ||
      req.body?.tutor_reference
  );
};

const getStudentReference = (req) => {
  return clean(
    req.query.reference ||
      req.query.studentReference ||
      req.query.student_reference ||
      req.body?.reference ||
      req.body?.studentReference ||
      req.body?.student_reference
  );
};

const getLessonId = (req) => {
  return clean(req.params.id);
};

const getFileUrl = (req, filename) => {
  const baseUrl =
    `${req.protocol}://${req.get("host")}`;

  return `${baseUrl}/uploads/academy-lessons/${encodeURIComponent(
    filename
  )}`;
};

const removeUploadedFiles = (files = []) => {
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
        "Unable to remove uploaded file:",
        error
      );
    }
  }
};

/* =========================================================
   DATABASE INITIALIZATION
========================================================= */

let databaseReadyPromise = null;

const ensureTables = async () => {
  if (!databaseReadyPromise) {
    databaseReadyPromise = (async () => {
      /* ---------------------------------------------------
         MAIN LESSON TABLE
      --------------------------------------------------- */

      await pool.query(`
        CREATE TABLE IF NOT EXISTS academy_lessons (
          id SERIAL PRIMARY KEY,
          tutor_reference TEXT NOT NULL,
          title TEXT NOT NULL,
          description TEXT DEFAULT '',
          content TEXT DEFAULT '',
          subject TEXT NOT NULL,
          class_name TEXT NOT NULL,
          grade TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'published',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      /* ---------------------------------------------------
         ADD MISSING COLUMNS
      --------------------------------------------------- */

      await pool.query(`
        ALTER TABLE academy_lessons
        ADD COLUMN IF NOT EXISTS tutor_reference TEXT
      `);

      await pool.query(`
        ALTER TABLE academy_lessons
        ADD COLUMN IF NOT EXISTS title TEXT
      `);

      await pool.query(`
        ALTER TABLE academy_lessons
        ADD COLUMN IF NOT EXISTS description TEXT DEFAULT ''
      `);

      await pool.query(`
        ALTER TABLE academy_lessons
        ADD COLUMN IF NOT EXISTS content TEXT DEFAULT ''
      `);

      await pool.query(`
        ALTER TABLE academy_lessons
        ADD COLUMN IF NOT EXISTS subject TEXT
      `);

      await pool.query(`
        ALTER TABLE academy_lessons
        ADD COLUMN IF NOT EXISTS class_name TEXT
      `);

      /*
       * IMPORTANT:
       * Your existing Neon table requires grade.
       */
      await pool.query(`
        ALTER TABLE academy_lessons
        ADD COLUMN IF NOT EXISTS grade TEXT
      `);

      await pool.query(`
        ALTER TABLE academy_lessons
        ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'published'
      `);

      await pool.query(`
        ALTER TABLE academy_lessons
        ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      `);

      await pool.query(`
        ALTER TABLE academy_lessons
        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      `);

      /* ---------------------------------------------------
         DEFAULTS
      --------------------------------------------------- */

      await pool.query(`
        ALTER TABLE academy_lessons
        ALTER COLUMN description SET DEFAULT ''
      `);

      await pool.query(`
        ALTER TABLE academy_lessons
        ALTER COLUMN content SET DEFAULT ''
      `);

      await pool.query(`
        ALTER TABLE academy_lessons
        ALTER COLUMN status SET DEFAULT 'published'
      `);

      await pool.query(`
        ALTER TABLE academy_lessons
        ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP
      `);

      await pool.query(`
        ALTER TABLE academy_lessons
        ALTER COLUMN updated_at SET DEFAULT CURRENT_TIMESTAMP
      `);

      /* ---------------------------------------------------
         FIX EXISTING NULL DATA
      --------------------------------------------------- */

      await pool.query(`
        UPDATE academy_lessons
        SET description = ''
        WHERE description IS NULL
      `);

      await pool.query(`
        UPDATE academy_lessons
        SET content = ''
        WHERE content IS NULL
      `);

      await pool.query(`
        UPDATE academy_lessons
        SET status = 'published'
        WHERE status IS NULL
           OR TRIM(status) = ''
      `);

      /*
       * Existing lessons that have class_name but no grade
       * get their grade from class_name.
       */
      await pool.query(`
        UPDATE academy_lessons
        SET grade = class_name
        WHERE (
          grade IS NULL
          OR TRIM(grade) = ''
        )
        AND class_name IS NOT NULL
        AND TRIM(class_name) <> ''
      `);

      /*
       * Existing lessons that have grade but no class_name
       * get class_name from grade.
       */
      await pool.query(`
        UPDATE academy_lessons
        SET class_name = grade
        WHERE (
          class_name IS NULL
          OR TRIM(class_name) = ''
        )
        AND grade IS NOT NULL
        AND TRIM(grade) <> ''
      `);

      /* ---------------------------------------------------
         RESOURCE TABLE
      --------------------------------------------------- */

      await pool.query(`
        CREATE TABLE IF NOT EXISTS academy_lesson_resources (
          id SERIAL PRIMARY KEY,
          lesson_id INTEGER NOT NULL
            REFERENCES academy_lessons(id)
            ON DELETE CASCADE,
          file_url TEXT NOT NULL,
          file_name TEXT NOT NULL,
          file_type TEXT DEFAULT '',
          file_size BIGINT DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await pool.query(`
        ALTER TABLE academy_lesson_resources
        ADD COLUMN IF NOT EXISTS lesson_id INTEGER
      `);

      await pool.query(`
        ALTER TABLE academy_lesson_resources
        ADD COLUMN IF NOT EXISTS file_url TEXT
      `);

      await pool.query(`
        ALTER TABLE academy_lesson_resources
        ADD COLUMN IF NOT EXISTS file_name TEXT
      `);

      await pool.query(`
        ALTER TABLE academy_lesson_resources
        ADD COLUMN IF NOT EXISTS file_type TEXT DEFAULT ''
      `);

      await pool.query(`
        ALTER TABLE academy_lesson_resources
        ADD COLUMN IF NOT EXISTS file_size BIGINT DEFAULT 0
      `);

      await pool.query(`
        ALTER TABLE academy_lesson_resources
        ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      `);

      /* ---------------------------------------------------
         PROGRESS TABLE
      --------------------------------------------------- */

      await pool.query(`
        CREATE TABLE IF NOT EXISTS academy_lesson_progress (
          id SERIAL PRIMARY KEY,
          lesson_id INTEGER NOT NULL
            REFERENCES academy_lessons(id)
            ON DELETE CASCADE,
          student_reference TEXT NOT NULL,
          completed BOOLEAN NOT NULL DEFAULT FALSE,
          completed_at TIMESTAMP NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(lesson_id, student_reference)
        )
      `);

      await pool.query(`
        ALTER TABLE academy_lesson_progress
        ADD COLUMN IF NOT EXISTS lesson_id INTEGER
      `);

      await pool.query(`
        ALTER TABLE academy_lesson_progress
        ADD COLUMN IF NOT EXISTS student_reference TEXT
      `);

      await pool.query(`
        ALTER TABLE academy_lesson_progress
        ADD COLUMN IF NOT EXISTS completed BOOLEAN DEFAULT FALSE
      `);

      await pool.query(`
        ALTER TABLE academy_lesson_progress
        ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP NULL
      `);

      await pool.query(`
        ALTER TABLE academy_lesson_progress
        ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      `);

      await pool.query(`
        ALTER TABLE academy_lesson_progress
        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      `);

      await pool.query(`
        UPDATE academy_lesson_progress
        SET completed = FALSE
        WHERE completed IS NULL
      `);

      /* ---------------------------------------------------
         INDEXES
      --------------------------------------------------- */

      await pool.query(`
        CREATE INDEX IF NOT EXISTS academy_lessons_tutor_reference_idx
        ON academy_lessons(tutor_reference)
      `);

      await pool.query(`
        CREATE INDEX IF NOT EXISTS academy_lessons_subject_idx
        ON academy_lessons(subject)
      `);

      await pool.query(`
        CREATE INDEX IF NOT EXISTS academy_lessons_class_name_idx
        ON academy_lessons(class_name)
      `);

      await pool.query(`
        CREATE INDEX IF NOT EXISTS academy_lessons_grade_idx
        ON academy_lessons(grade)
      `);

      await pool.query(`
        CREATE INDEX IF NOT EXISTS academy_lesson_resources_lesson_id_idx
        ON academy_lesson_resources(lesson_id)
      `);

      await pool.query(`
        CREATE INDEX IF NOT EXISTS academy_lesson_progress_lesson_id_idx
        ON academy_lesson_progress(lesson_id)
      `);

      await pool.query(`
        CREATE INDEX IF NOT EXISTS academy_lesson_progress_student_reference_idx
        ON academy_lesson_progress(student_reference)
      `);

      await pool.query(`
        CREATE UNIQUE INDEX IF NOT EXISTS academy_lesson_progress_student_lesson_unique
        ON academy_lesson_progress(
          lesson_id,
          student_reference
        )
      `);

      console.log(
        "✅ Academy lesson database is ready."
      );
    })().catch((error) => {
      databaseReadyPromise = null;

      console.error(
        "❌ Academy lesson database initialization error:",
        error
      );

      throw error;
    });
  }

  return databaseReadyPromise;
};

/* =========================================================
   TUTOR
   GET ALL LESSONS
========================================================= */

router.get(
  "/tutor/lessons",
  async (req, res) => {
    try {
      await ensureTables();

      const tutorReference =
        getTutorReference(req);

      if (!tutorReference) {
        return res.status(400).json({
          success: false,
          message:
            "Tutor reference is required.",
        });
      }

      const result =
        await pool.query(
          `
          SELECT
            l.*,
            COUNT(r.id)::INTEGER AS resource_count
          FROM academy_lessons l
          LEFT JOIN academy_lesson_resources r
            ON r.lesson_id = l.id
          WHERE l.tutor_reference = $1
          GROUP BY l.id
          ORDER BY l.created_at DESC
          `,
          [tutorReference]
        );

      return res.json({
        success: true,
        lessons: result.rows,
      });
    } catch (error) {
      console.error(
        "GET tutor lessons error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to load lessons.",
        error: error.message,
      });
    }
  }
);

/* =========================================================
   TUTOR
   GET SINGLE LESSON
========================================================= */

router.get(
  "/tutor/lessons/:id",
  async (req, res) => {
    try {
      await ensureTables();

      const tutorReference =
        getTutorReference(req);

      const lessonId =
        getLessonId(req);

      if (!tutorReference) {
        return res.status(400).json({
          success: false,
          message:
            "Tutor reference is required.",
        });
      }

      if (!lessonId) {
        return res.status(400).json({
          success: false,
          message:
            "Lesson ID is required.",
        });
      }

      const lessonResult =
        await pool.query(
          `
          SELECT *
          FROM academy_lessons
          WHERE id = $1
            AND tutor_reference = $2
          LIMIT 1
          `,
          [
            lessonId,
            tutorReference,
          ]
        );

      if (
        !lessonResult.rows.length
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Lesson not found.",
        });
      }

      const resourcesResult =
        await pool.query(
          `
          SELECT *
          FROM academy_lesson_resources
          WHERE lesson_id = $1
          ORDER BY created_at ASC
          `,
          [lessonId]
        );

      return res.json({
        success: true,
        lesson: {
          ...lessonResult.rows[0],
          resources:
            resourcesResult.rows,
        },
      });
    } catch (error) {
      console.error(
        "GET tutor lesson error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to load lesson.",
        error: error.message,
      });
    }
  }
);

/* =========================================================
   TUTOR
   CREATE LESSON
========================================================= */

router.post(
  "/tutor/lessons",
  upload.array(
    "files",
    MAX_FILES
  ),
  async (req, res) => {
    const uploadedFiles =
      req.files || [];

    try {
      await ensureTables();

      const tutorReference =
        getTutorReference(req);

      const title =
        clean(req.body.title);

      const description =
        clean(req.body.description);

      const content =
        clean(req.body.content);

      const subject =
        clean(req.body.subject);

      /*
       * Accept class from all frontend naming styles.
       */
      const className =
        clean(
          req.body.class_name ||
            req.body.className ||
            req.body.class ||
            req.body.grade
        );

      /*
       * IMPORTANT FIX:
       *
       * Neon requires academy_lessons.grade.
       *
       * If the frontend sends grade, use it.
       * Otherwise use the selected class.
       */
      const grade =
        clean(
          req.body.grade ||
            req.body.class_name ||
            req.body.className ||
            req.body.class
        ) || className;

      const status =
        clean(
          req.body.status
        ).toLowerCase() ||
        "published";

      /* ---------------------------------------------------
         VALIDATION
      --------------------------------------------------- */

      if (!tutorReference) {
        removeUploadedFiles(
          uploadedFiles
        );

        return res.status(400).json({
          success: false,
          message:
            "Tutor reference is required.",
        });
      }

      if (!title) {
        removeUploadedFiles(
          uploadedFiles
        );

        return res.status(400).json({
          success: false,
          message:
            "Lesson title is required.",
        });
      }

      if (!subject) {
        removeUploadedFiles(
          uploadedFiles
        );

        return res.status(400).json({
          success: false,
          message:
            "Subject is required.",
        });
      }

      if (!className) {
        removeUploadedFiles(
          uploadedFiles
        );

        return res.status(400).json({
          success: false,
          message:
            "Class is required.",
        });
      }

      if (!grade) {
        removeUploadedFiles(
          uploadedFiles
        );

        return res.status(400).json({
          success: false,
          message:
            "Grade is required.",
        });
      }

      /* ---------------------------------------------------
         CREATE LESSON
      --------------------------------------------------- */

      const lessonResult =
        await pool.query(
          `
          INSERT INTO academy_lessons (
            tutor_reference,
            title,
            description,
            content,
            subject,
            class_name,
            grade,
            status
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
            tutorReference,
            title,
            description,
            content,
            subject,
            className,
            grade,
            status,
          ]
        );

      const lesson =
        lessonResult.rows[0];

      const resources = [];

      /* ---------------------------------------------------
         SAVE RESOURCES
      --------------------------------------------------- */

      for (const file of uploadedFiles) {
        const fileUrl =
          getFileUrl(
            req,
            file.filename
          );

        const resourceResult =
          await pool.query(
            `
            INSERT INTO academy_lesson_resources (
              lesson_id,
              file_url,
              file_name,
              file_type,
              file_size
            )
            VALUES (
              $1,
              $2,
              $3,
              $4,
              $5
            )
            RETURNING *
            `,
            [
              lesson.id,
              fileUrl,
              file.originalname,
              file.mimetype,
              file.size || 0,
            ]
          );

        resources.push(
          resourceResult.rows[0]
        );
      }

      return res.status(201).json({
        success: true,
        message:
          "Lesson created successfully.",
        lesson: {
          ...lesson,
          resources,
        },
      });
    } catch (error) {
      console.error(
        "CREATE lesson error:",
        error
      );

      removeUploadedFiles(
        uploadedFiles
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to create lesson.",
        error: error.message,
      });
    }
  }
);

/* =========================================================
   TUTOR
   UPDATE LESSON
========================================================= */

router.patch(
  "/tutor/lessons/:id",
  upload.array(
    "files",
    MAX_FILES
  ),
  async (req, res) => {
    const uploadedFiles =
      req.files || [];

    try {
      await ensureTables();

      const tutorReference =
        getTutorReference(req);

      const lessonId =
        getLessonId(req);

      if (!tutorReference) {
        removeUploadedFiles(
          uploadedFiles
        );

        return res.status(400).json({
          success: false,
          message:
            "Tutor reference is required.",
        });
      }

      if (!lessonId) {
        removeUploadedFiles(
          uploadedFiles
        );

        return res.status(400).json({
          success: false,
          message:
            "Lesson ID is required.",
        });
      }

      const existingResult =
        await pool.query(
          `
          SELECT *
          FROM academy_lessons
          WHERE id = $1
            AND tutor_reference = $2
          LIMIT 1
          `,
          [
            lessonId,
            tutorReference,
          ]
        );

      if (
        !existingResult.rows.length
      ) {
        removeUploadedFiles(
          uploadedFiles
        );

        return res.status(404).json({
          success: false,
          message:
            "Lesson not found.",
        });
      }

      const existing =
        existingResult.rows[0];

      const title =
        req.body.title !== undefined
          ? clean(req.body.title)
          : existing.title;

      const description =
        req.body.description !==
        undefined
          ? clean(
              req.body.description
            )
          : existing.description || "";

      const content =
        req.body.content !== undefined
          ? clean(req.body.content)
          : existing.content || "";

      const subject =
        req.body.subject !== undefined
          ? clean(req.body.subject)
          : existing.subject;

      const className =
        clean(
          req.body.class_name ||
            req.body.className ||
            req.body.class ||
            req.body.grade ||
            existing.class_name ||
            existing.grade
        );

      /*
       * IMPORTANT:
       * Never update grade with NULL.
       */
      const grade =
        clean(
          req.body.grade ||
            req.body.class_name ||
            req.body.className ||
            req.body.class ||
            existing.grade ||
            existing.class_name
        ) || className;

      const status =
        req.body.status !== undefined
          ? clean(
              req.body.status
            ).toLowerCase()
          : existing.status ||
            "published";

      if (!title) {
        removeUploadedFiles(
          uploadedFiles
        );

        return res.status(400).json({
          success: false,
          message:
            "Lesson title is required.",
        });
      }

      if (!subject) {
        removeUploadedFiles(
          uploadedFiles
        );

        return res.status(400).json({
          success: false,
          message:
            "Subject is required.",
        });
      }

      if (!className) {
        removeUploadedFiles(
          uploadedFiles
        );

        return res.status(400).json({
          success: false,
          message:
            "Class is required.",
        });
      }

      if (!grade) {
        removeUploadedFiles(
          uploadedFiles
        );

        return res.status(400).json({
          success: false,
          message:
            "Grade is required.",
        });
      }

      const lessonResult =
        await pool.query(
          `
          UPDATE academy_lessons
          SET
            title = $1,
            description = $2,
            content = $3,
            subject = $4,
            class_name = $5,
            grade = $6,
            status = $7,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = $8
            AND tutor_reference = $9
          RETURNING *
          `,
          [
            title,
            description,
            content,
            subject,
            className,
            grade,
            status,
            lessonId,
            tutorReference,
          ]
        );

      const newResources = [];

      for (const file of uploadedFiles) {
        const fileUrl =
          getFileUrl(
            req,
            file.filename
          );

        const resourceResult =
          await pool.query(
            `
            INSERT INTO academy_lesson_resources (
              lesson_id,
              file_url,
              file_name,
              file_type,
              file_size
            )
            VALUES (
              $1,
              $2,
              $3,
              $4,
              $5
            )
            RETURNING *
            `,
            [
              lessonId,
              fileUrl,
              file.originalname,
              file.mimetype,
              file.size || 0,
            ]
          );

        newResources.push(
          resourceResult.rows[0]
        );
      }

      const allResourcesResult =
        await pool.query(
          `
          SELECT *
          FROM academy_lesson_resources
          WHERE lesson_id = $1
          ORDER BY created_at ASC
          `,
          [lessonId]
        );

      return res.json({
        success: true,
        message:
          "Lesson updated successfully.",
        lesson: {
          ...lessonResult.rows[0],
          resources:
            allResourcesResult.rows.length
              ? allResourcesResult.rows
              : newResources,
        },
      });
    } catch (error) {
      console.error(
        "UPDATE lesson error:",
        error
      );

      removeUploadedFiles(
        uploadedFiles
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to update lesson.",
        error: error.message,
      });
    }
  }
);

/* =========================================================
   TUTOR
   DELETE LESSON
========================================================= */

router.delete(
  "/tutor/lessons/:id",
  async (req, res) => {
    try {
      await ensureTables();

      const tutorReference =
        getTutorReference(req);

      const lessonId =
        getLessonId(req);

      if (!tutorReference) {
        return res.status(400).json({
          success: false,
          message:
            "Tutor reference is required.",
        });
      }

      if (!lessonId) {
        return res.status(400).json({
          success: false,
          message:
            "Lesson ID is required.",
        });
      }

      const resourcesResult =
        await pool.query(
          `
          SELECT file_url
          FROM academy_lesson_resources
          WHERE lesson_id = $1
          `,
          [lessonId]
        );

      const deleteResult =
        await pool.query(
          `
          DELETE FROM academy_lessons
          WHERE id = $1
            AND tutor_reference = $2
          RETURNING id
          `,
          [
            lessonId,
            tutorReference,
          ]
        );

      if (
        !deleteResult.rows.length
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Lesson not found.",
        });
      }

      for (const resource of resourcesResult.rows) {
        try {
          const fileUrl =
            resource.file_url;

          if (!fileUrl) {
            continue;
          }

          const pathname =
            new URL(
              fileUrl
            ).pathname;

          const filename =
            decodeURIComponent(
              path.basename(
                pathname
              )
            );

          const filePath =
            path.join(
              uploadDirectory,
              filename
            );

          if (
            fs.existsSync(filePath)
          ) {
            fs.unlinkSync(
              filePath
            );
          }
        } catch {
          // Continue if physical file cannot be removed.
        }
      }

      return res.json({
        success: true,
        message:
          "Lesson deleted successfully.",
      });
    } catch (error) {
      console.error(
        "DELETE lesson error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to delete lesson.",
        error: error.message,
      });
    }
  }
);

/* =========================================================
   STUDENT
   GET LESSONS
========================================================= */

router.get(
  "/student/lessons",
  async (req, res) => {
    try {
      await ensureTables();

      const studentReference =
        getStudentReference(req);

      const subject =
        clean(
          req.query.subject
        );

      const className =
        clean(
          req.query.class_name ||
            req.query.className ||
            req.query.class ||
            req.query.grade
        );

      const values = [];

      const conditions = [
        `l.status = 'published'`,
      ];

      if (subject) {
        values.push(subject);

        conditions.push(
          `LOWER(l.subject) = LOWER($${values.length})`
        );
      }

      if (className) {
        values.push(className);

        conditions.push(
          `(
            LOWER(l.class_name) = LOWER($${values.length})
            OR
            LOWER(l.grade) = LOWER($${values.length})
          )`
        );
      }

      let progressJoin = "";

      if (studentReference) {
        values.push(
          studentReference
        );

        progressJoin = `
          LEFT JOIN academy_lesson_progress p
            ON p.lesson_id = l.id
           AND p.student_reference = $${values.length}
        `;
      }

      const result =
        await pool.query(
          `
          SELECT
            l.*,
            COUNT(r.id)::INTEGER AS resource_count,

            ${
              studentReference
                ? "COALESCE(p.completed, FALSE)"
                : "FALSE"
            } AS completed,

            ${
              studentReference
                ? "p.completed_at"
                : "NULL"
            } AS completed_at

          FROM academy_lessons l

          LEFT JOIN academy_lesson_resources r
            ON r.lesson_id = l.id

          ${progressJoin}

          WHERE ${conditions.join(
            " AND "
          )}

          GROUP BY
            l.id
            ${
              studentReference
                ? ", p.completed, p.completed_at"
                : ""
            }

          ORDER BY
            l.created_at DESC
          `,
          values
        );

      return res.json({
        success: true,
        lessons:
          result.rows,
      });
    } catch (error) {
      console.error(
        "GET student lessons error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to load lessons.",
        error: error.message,
      });
    }
  }
);

/* =========================================================
   STUDENT
   GET SINGLE LESSON
========================================================= */

router.get(
  "/student/lessons/:id",
  async (req, res) => {
    try {
      await ensureTables();

      const studentReference =
        getStudentReference(req);

      const lessonId =
        getLessonId(req);

      if (!lessonId) {
        return res.status(400).json({
          success: false,
          message:
            "Lesson ID is required.",
        });
      }

      const lessonResult =
        await pool.query(
          `
          SELECT *
          FROM academy_lessons
          WHERE id = $1
            AND status = 'published'
          LIMIT 1
          `,
          [lessonId]
        );

      if (
        !lessonResult.rows.length
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Lesson not found.",
        });
      }

      const resourcesResult =
        await pool.query(
          `
          SELECT *
          FROM academy_lesson_resources
          WHERE lesson_id = $1
          ORDER BY created_at ASC
          `,
          [lessonId]
        );

      let progress = {
        completed: false,
        completed_at: null,
      };

      if (studentReference) {
        const progressResult =
          await pool.query(
            `
            SELECT
              completed,
              completed_at
            FROM academy_lesson_progress
            WHERE lesson_id = $1
              AND student_reference = $2
            LIMIT 1
            `,
            [
              lessonId,
              studentReference,
            ]
          );

        if (
          progressResult.rows.length
        ) {
          progress =
            progressResult.rows[0];
        }
      }

      return res.json({
        success: true,
        lesson: {
          ...lessonResult.rows[0],
          resources:
            resourcesResult.rows,
          progress,
        },
      });
    } catch (error) {
      console.error(
        "GET student lesson error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to load lesson.",
        error: error.message,
      });
    }
  }
);

/* =========================================================
   STUDENT
   MARK COMPLETE
========================================================= */

router.patch(
  "/student/lessons/:id/complete",
  async (req, res) => {
    try {
      await ensureTables();

      const studentReference =
        getStudentReference(req);

      const lessonId =
        getLessonId(req);

      if (!studentReference) {
        return res.status(400).json({
          success: false,
          message:
            "Student reference is required.",
        });
      }

      if (!lessonId) {
        return res.status(400).json({
          success: false,
          message:
            "Lesson ID is required.",
        });
      }

      const lessonResult =
        await pool.query(
          `
          SELECT id
          FROM academy_lessons
          WHERE id = $1
            AND status = 'published'
          LIMIT 1
          `,
          [lessonId]
        );

      if (
        !lessonResult.rows.length
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Lesson not found.",
        });
      }

      const progressResult =
        await pool.query(
          `
          INSERT INTO academy_lesson_progress (
            lesson_id,
            student_reference,
            completed,
            completed_at,
            updated_at
          )
          VALUES (
            $1,
            $2,
            TRUE,
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
          )

          ON CONFLICT (
            lesson_id,
            student_reference
          )

          DO UPDATE SET
            completed = TRUE,
            completed_at = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP

          RETURNING *
          `,
          [
            lessonId,
            studentReference,
          ]
        );

      return res.json({
        success: true,
        message:
          "Lesson marked as completed.",
        progress:
          progressResult.rows[0],
      });
    } catch (error) {
      console.error(
        "MARK lesson complete error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to mark lesson as completed.",
        error: error.message,
      });
    }
  }
);

/* =========================================================
   STUDENT
   MARK INCOMPLETE
========================================================= */

router.patch(
  "/student/lessons/:id/incomplete",
  async (req, res) => {
    try {
      await ensureTables();

      const studentReference =
        getStudentReference(req);

      const lessonId =
        getLessonId(req);

      if (!studentReference) {
        return res.status(400).json({
          success: false,
          message:
            "Student reference is required.",
        });
      }

      if (!lessonId) {
        return res.status(400).json({
          success: false,
          message:
            "Lesson ID is required.",
        });
      }

      const result =
        await pool.query(
          `
          UPDATE academy_lesson_progress
          SET
            completed = FALSE,
            completed_at = NULL,
            updated_at = CURRENT_TIMESTAMP
          WHERE lesson_id = $1
            AND student_reference = $2
          RETURNING *
          `,
          [
            lessonId,
            studentReference,
          ]
        );

      return res.json({
        success: true,
        message:
          "Lesson marked as incomplete.",
        progress:
          result.rows[0] || {
            lesson_id:
              lessonId,
            student_reference:
              studentReference,
            completed: false,
            completed_at: null,
          },
      });
    } catch (error) {
      console.error(
        "MARK lesson incomplete error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to update lesson progress.",
        error: error.message,
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
          message:
            "A file is too large. Maximum size is 250MB.",
        });
      }

      if (
        error.code ===
        "LIMIT_FILE_COUNT"
      ) {
        return res.status(400).json({
          success: false,
          message:
            `You can upload a maximum of ${MAX_FILES} files.`,
        });
      }

      return res.status(400).json({
        success: false,
        message:
          error.message,
      });
    }

    if (error) {
      console.error(
        "Academy lesson upload error:",
        error
      );

      return res.status(400).json({
        success: false,
        message:
          error.message ||
          "File upload failed.",
      });
    }
  }
);

/* =========================================================
   EXPORT
========================================================= */

export default router;
