import express from "express";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import pool from "../lib/db.js";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import {
  resolveAuthenticatedStudent,
  getSubjectsFromEnrollment,
  subjectsMatch,
  classesMatch,
} from "./academyEnrollmentRoutes.js";

const router = express.Router();

/* =========================================================
   CONFIGURATION
========================================================= */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOAD_DIRECTORY = path.resolve(
  __dirname,
  "../uploads/live-presentations"
);

const MAX_PRESENTATION_SIZE = 50 * 1024 * 1024;

const ALLOWED_PRESENTATION_EXTENSIONS = [
  ".pdf",
  ".ppt",
  ".pptx",
];

const ALLOWED_PRESENTATION_MIMES = [
  "application/pdf",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/octet-stream",
];

const JWT_SECRET =
  process.env.JWT_SECRET?.trim() ||
  process.env.ACADEMY_JWT_SECRET?.trim() ||
  process.env.AUTH_SECRET?.trim() ||
  "scholiqen-development-secret";

const FRONTEND_URL = (
  process.env.FRONTEND_URL?.trim() ||
  "http://localhost:5173"
).replace(/\/+$/, "");

const clean = (value) =>
  value === undefined || value === null
    ? ""
    : String(value).trim();

const getTutorReference = (req, body = {}) =>
  clean(
    req.headers["x-tutor-reference"] ||
      req.headers["x-tutor-ref"] ||
      req.headers["x-academy-tutor-reference"] ||
      body.tutorReference ||
      body.tutor_reference ||
      req.query?.tutorReference ||
      req.query?.tutor_reference
  );

const getSessionId = (req) =>
  clean(
    req.params.id ||
      req.body?.sessionId ||
      req.body?.session_id
  );

const makeRoomCode = () =>
  crypto.randomBytes(6).toString("hex").toUpperCase();

const makeJoinUrl = (roomCode) =>
  `${FRONTEND_URL}/academy/live-class/${roomCode}`;

const isValidBigIntId = (value) =>
  /^\d+$/.test(clean(value));

const getBearerToken = (req) => {
  const authorization = clean(req.headers.authorization);

  if (authorization.toLowerCase().startsWith("bearer ")) {
    return authorization.slice(7).trim();
  }

  return clean(
    req.headers["x-academy-token"] ||
      req.headers["x-student-token"]
  );
};

const parseSubjects = (value) => {
  if (Array.isArray(value)) return value;
  if (!value) return [];

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);

      return Array.isArray(parsed)
        ? parsed
        : parsed
          ? [parsed]
          : [];
    } catch {
      return value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }

  if (typeof value === "object") {
    return Object.values(value);
  }

  return [];
};

const normaliseSession = (row) => {
  if (!row) return null;

  const roomCode =
    clean(row.room_code) ||
    clean(row.room_id);

  const joinUrl =
    clean(row.join_url) ||
    clean(row.meeting_url);

  return {
    id: row.id,
    title: row.title || "Live Class",
    description: row.description || "",
    tutor_reference: row.tutor_reference || "",
    tutor_name:
      row.tutor_name ||
      row.tutor_reference ||
      "Assigned Tutor",
    grade: row.grade || "",
    class_id: row.class_id || "",
    class_name:
      row.class_name ||
      row.grade ||
      "",
    subject: row.subject || "",
    scheduled_at:
      row.scheduled_at ||
      row.scheduled_start ||
      null,
    scheduled_start:
      row.scheduled_start ||
      row.scheduled_at ||
      null,
    started_at:
      row.started_at ||
      row.actual_start ||
      null,
    actual_start:
      row.actual_start ||
      row.started_at ||
      null,
    ended_at:
      row.ended_at ||
      row.actual_end ||
      null,
    actual_end:
      row.actual_end ||
      row.ended_at ||
      null,
    status: row.status || "scheduled",
    room_id: roomCode,
    room_code: roomCode,
    join_url: joinUrl,
    meeting_url: joinUrl,
    recording_status: row.recording_status || "",
    recording_url: row.recording_url || "",
    recording_duration:
      row.recording_duration ??
      row.duration_seconds ??
      null,
    duration_seconds:
      row.duration_seconds ??
      row.recording_duration ??
      null,
    subjects: row.subjects || null,
    participants: Number(row.participants || 0),
    created_at: row.created_at || null,
    updated_at: row.updated_at || null,
  };
};

const sendError = (res, error, fallbackMessage) => {
  console.error(fallbackMessage, error);

  return res.status(error.status || 500).json({
    success: false,
    message: error.message || fallbackMessage,
  });
};

/* =========================================================
   PRESENTATION UPLOAD CONFIGURATION
========================================================= */

const presentationStorage = multer.diskStorage({
  destination: async (req, file, callback) => {
    try {
      await fs.promises.mkdir(UPLOAD_DIRECTORY, {
        recursive: true,
      });

      callback(null, UPLOAD_DIRECTORY);
    } catch (error) {
      callback(error);
    }
  },

  filename: (req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();

    callback(
      null,
      `${crypto.randomUUID()}${extension}`
    );
  },
});

const presentationUpload = multer({
  storage: presentationStorage,

  limits: {
    fileSize: MAX_PRESENTATION_SIZE,
    files: 1,
  },

  fileFilter: (req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();

    if (!ALLOWED_PRESENTATION_EXTENSIONS.includes(extension)) {
      const error = new Error(
        "Only PDF, PPT and PPTX presentations are allowed"
      );

      error.status = 400;
      return callback(error);
    }

    if (!ALLOWED_PRESENTATION_MIMES.includes(file.mimetype)) {
      const error = new Error(
        "Unsupported presentation file type"
      );

      error.status = 400;
      return callback(error);
    }

    callback(null, true);
  },
});

const handlePresentationUpload = (req, res, next) => {
  presentationUpload.single("file")(req, res, (error) => {
    if (!error) return next();

    if (error instanceof multer.MulterError) {
      const message =
        error.code === "LIMIT_FILE_SIZE"
          ? "Presentation file must not exceed 50MB"
          : error.message;

      return res.status(400).json({
        success: false,
        message,
      });
    }

    return res.status(error.status || 400).json({
      success: false,
      message: error.message || "Presentation upload failed",
    });
  });
};

const getPresentationPublicUrl = (filename) =>
  `/uploads/live-presentations/${encodeURIComponent(filename)}`;

const getPresentationFilenameFromUrl = (fileUrl) => {
  const value = clean(fileUrl);

  if (!value) return "";

  try {
    const pathname = value.startsWith("http://") ||
      value.startsWith("https://")
      ? new URL(value).pathname
      : value;

    const prefix = "/uploads/live-presentations/";

    if (!pathname.startsWith(prefix)) return "";

    const filename = path.basename(
      decodeURIComponent(pathname.slice(prefix.length))
    );

    if (!filename || filename === "." || filename === "..") {
      return "";
    }

    return filename;
  } catch {
    return "";
  }
};

const removePresentationFile = async (fileUrl) => {
  const filename = getPresentationFilenameFromUrl(fileUrl);

  if (!filename) return;

  const filePath = path.resolve(
    UPLOAD_DIRECTORY,
    filename
  );

  if (!filePath.startsWith(`${UPLOAD_DIRECTORY}${path.sep}`)) {
    return;
  }

  try {
    await fs.promises.unlink(filePath);
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.error("Could not remove presentation file:", error);
    }
  }
};

const normalisePresentation = (row) => {
  if (!row) return null;

  const fileUrl = clean(row.file_url);

  const extension = path.extname(
    row.original_filename || row.title || fileUrl
  ).toLowerCase();

  return {
    id: row.id,
    live_class_id: row.live_class_id,
    name: row.title || "Presentation",
    title: row.title || "Presentation",
    file_name: row.original_filename || row.title || "Presentation",
    original_filename:
      row.original_filename ||
      row.title ||
      "Presentation",
    url: fileUrl,
    file_url: fileUrl,
    fileUrl,
    type:
      extension === ".pdf"
        ? "application/pdf"
        : extension === ".ppt"
          ? "application/vnd.ms-powerpoint"
          : "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    size: Number(row.file_size || 0),
    total_pages: Number(row.total_pages || 1),
    current_page: Number(row.current_page || 1),
    is_active: row.is_active !== false,
    created_at: row.created_at || null,
    updated_at: row.updated_at || null,
  };
};

/* =========================================================
   DATABASE SETUP
========================================================= */

const ensureLiveClassTables = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS academy_live_classes (
      id BIGSERIAL PRIMARY KEY,
      tutor_reference TEXT,
      grade TEXT NOT NULL,
      subjects JSONB,
      title TEXT,
      description TEXT,
      status TEXT DEFAULT 'scheduled',
      scheduled_start TIMESTAMPTZ,
      actual_start TIMESTAMPTZ,
      actual_end TIMESTAMPTZ,
      room_id TEXT,
      recording_status TEXT,
      recording_url TEXT,
      duration_seconds INTEGER,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      class_id TEXT,
      class_name TEXT,
      subject TEXT,
      scheduled_at TIMESTAMPTZ,
      started_at TIMESTAMPTZ,
      ended_at TIMESTAMPTZ,
      room_code TEXT,
      join_url TEXT,
      meeting_url TEXT,
      recording_duration INTEGER
    )
  `);

  await pool.query(`
    ALTER TABLE academy_live_classes
      ADD COLUMN IF NOT EXISTS tutor_reference TEXT,
      ADD COLUMN IF NOT EXISTS grade TEXT,
      ADD COLUMN IF NOT EXISTS subjects JSONB,
      ADD COLUMN IF NOT EXISTS title TEXT,
      ADD COLUMN IF NOT EXISTS description TEXT,
      ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'scheduled',
      ADD COLUMN IF NOT EXISTS scheduled_start TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS actual_start TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS actual_end TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS room_id TEXT,
      ADD COLUMN IF NOT EXISTS recording_status TEXT,
      ADD COLUMN IF NOT EXISTS recording_url TEXT,
      ADD COLUMN IF NOT EXISTS duration_seconds INTEGER,
      ADD COLUMN IF NOT EXISTS class_id TEXT,
      ADD COLUMN IF NOT EXISTS class_name TEXT,
      ADD COLUMN IF NOT EXISTS subject TEXT,
      ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS ended_at TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS room_code TEXT,
      ADD COLUMN IF NOT EXISTS join_url TEXT,
      ADD COLUMN IF NOT EXISTS meeting_url TEXT,
      ADD COLUMN IF NOT EXISTS recording_duration INTEGER,
      ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW()
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS academy_live_participants (
      id BIGSERIAL PRIMARY KEY,
      live_class_id BIGINT,
      enrollment_id TEXT,
      student_name TEXT,
      role TEXT,
      joined_at TIMESTAMPTZ,
      left_at TIMESTAMPTZ,
      is_present BOOLEAN DEFAULT FALSE,
      total_seconds INTEGER,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS academy_live_chat (
      id BIGSERIAL PRIMARY KEY,
      live_class_id BIGINT,
      sender_id TEXT,
      sender_name TEXT,
      sender_role TEXT,
      message TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS academy_live_recordings (
      id BIGSERIAL PRIMARY KEY,
      live_class_id BIGINT,
      tutor_reference TEXT,
      title TEXT,
      recording_url TEXT,
      thumbnail_url TEXT,
      duration_seconds INTEGER,
      file_size BIGINT,
      status TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS academy_live_resources (
      id BIGSERIAL PRIMARY KEY,
      live_class_id BIGINT,
      resource_type TEXT,
      title TEXT,
      file_url TEXT,
      current_page INTEGER,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await pool.query(`
    ALTER TABLE academy_live_resources
      ADD COLUMN IF NOT EXISTS original_filename TEXT,
      ADD COLUMN IF NOT EXISTS file_size BIGINT,
      ADD COLUMN IF NOT EXISTS total_pages INTEGER DEFAULT 1,
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW()
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS academy_live_whiteboard_events (
      id BIGSERIAL PRIMARY KEY,
      live_class_id BIGINT,
      event_type TEXT,
      payload JSONB,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_live_classes_room_code
    ON academy_live_classes (room_code)
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_live_classes_room_id
    ON academy_live_classes (room_id)
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_live_classes_tutor
    ON academy_live_classes (tutor_reference)
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_live_participants_class
    ON academy_live_participants (live_class_id)
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_live_participants_enrollment
    ON academy_live_participants (enrollment_id)
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_live_chat_class
    ON academy_live_chat (live_class_id)
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_live_resources_presentation
    ON academy_live_resources (
      live_class_id,
      resource_type,
      is_active,
      created_at DESC
    )
  `);
};

let databaseSetupPromise = null;

const initialiseLiveClassDatabase = async () => {
  if (!databaseSetupPromise) {
    databaseSetupPromise = ensureLiveClassTables().catch((error) => {
      databaseSetupPromise = null;
      throw error;
    });
  }

  return databaseSetupPromise;
};

router.use(async (req, res, next) => {
  try {
    await initialiseLiveClassDatabase();
    return next();
  } catch (error) {
    console.error("Live class database setup error:", error);

    return res.status(500).json({
      success: false,
      message: "Live class database is not ready",
      error: error.message,
    });
  }
});

/* =========================================================
   AUTHENTICATE STUDENT
========================================================= */

const authenticateLiveClassStudent = async (req) => {
  const token = getBearerToken(req);

  if (!token) {
    const error = new Error("Student authentication is required");
    error.status = 401;
    throw error;
  }

  let decoded;

  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch {
    const error = new Error("Invalid or expired student session");
    error.status = 401;
    throw error;
  }

  const userType = clean(
    decoded.userType ||
      decoded.user_type ||
      decoded.type ||
      decoded.role
  ).toLowerCase();

  if (
    ![
      "student",
      "academy_student",
      "academystudent",
    ].includes(userType)
  ) {
    const error = new Error("A valid student account is required");
    error.status = 403;
    throw error;
  }

  const auth = await resolveAuthenticatedStudent(req);

  if (!auth || !auth.student || !auth.serialized) {
    const error = new Error(
      "Student enrollment could not be verified"
    );
    error.status = 401;
    throw error;
  }

  const serialized = auth.serialized;

  const tokenStudentId = clean(
    decoded.studentId ||
      decoded.student_id ||
      decoded.id
  );

  const tokenEnrollmentId = clean(
    decoded.enrollmentId ||
      decoded.enrollment_id ||
      decoded.studentEnrollmentId ||
      decoded.student_enrollment_id ||
      decoded.enrollmentReference ||
      decoded.enrollment_reference
  );

  const tokenEmail = clean(decoded.email).toLowerCase();

  const resolvedStudentId = clean(
    serialized.studentId ||
      serialized.student_id ||
      serialized.id
  );

  const resolvedEnrollmentId = clean(
    serialized.enrollmentId ||
      serialized.enrollment_id ||
      serialized.studentEnrollmentId ||
      serialized.student_enrollment_id
  );

  const resolvedEmail = clean(serialized.email).toLowerCase();

  const hasMatchingIdentity =
    Boolean(
      tokenStudentId &&
      resolvedStudentId &&
      tokenStudentId === resolvedStudentId
    ) ||
    Boolean(
      tokenEnrollmentId &&
      resolvedEnrollmentId &&
      tokenEnrollmentId === resolvedEnrollmentId
    ) ||
    Boolean(
      tokenEmail &&
      resolvedEmail &&
      tokenEmail === resolvedEmail
    );

  if (!hasMatchingIdentity) {
    const error = new Error(
      "Your student session does not match this enrollment"
    );
    error.status = 403;
    throw error;
  }

  if (
    tokenEnrollmentId &&
    resolvedEnrollmentId &&
    tokenEnrollmentId !== resolvedEnrollmentId
  ) {
    const error = new Error("Student enrollment mismatch");
    error.status = 403;
    throw error;
  }

  if (
    tokenStudentId &&
    resolvedStudentId &&
    tokenStudentId !== resolvedStudentId
  ) {
    const error = new Error("Student account mismatch");
    error.status = 403;
    throw error;
  }

  const registeredSubjects = getSubjectsFromEnrollment(
    auth.student,
    auth.columns
  );

  return {
    ...auth,
    decoded,
    studentId: resolvedStudentId || tokenStudentId,
    enrollmentId:
      resolvedEnrollmentId ||
      tokenEnrollmentId ||
      resolvedStudentId ||
      tokenStudentId,
    studentName:
      clean(serialized.name) ||
      clean(serialized.fullName) ||
      clean(serialized.full_name) ||
      "Student",
    studentClass: clean(auth.studentClass),
    registeredSubjects: Array.isArray(registeredSubjects)
      ? registeredSubjects
      : [],
  };
};

const studentCanAccessSession = (student, session) => {
  const studentClass = clean(student.studentClass);

  const sessionClass =
    clean(session.class_name) ||
    clean(session.grade);

  if (
    !studentClass ||
    !sessionClass ||
    !classesMatch(studentClass, sessionClass)
  ) {
    return false;
  }

  const studentSubjects = student.registeredSubjects || [];

  if (!studentSubjects.length) return false;

  const sessionSubjects = [
    ...parseSubjects(session.subjects),
    clean(session.subject),
  ].filter(Boolean);

  return sessionSubjects.some((sessionSubject) =>
    studentSubjects.some((studentSubject) =>
      subjectsMatch(
        clean(studentSubject),
        clean(sessionSubject)
      )
    )
  );
};

/* =========================================================
   PRESENTATION ROUTES
========================================================= */

/*
 * Upload a presentation.
 *
 * POST /api/academy/live-classes/:id/presentation
 *
 * Multipart field: file
 *
 * Accepts PDF, PPT and PPTX up to 50MB.
 */
router.post(
  "/live-classes/:id/presentation",
  handlePresentationUpload,
  async (req, res) => {
    let uploadedFileUrl = "";

    try {
      const id = getSessionId(req);

      if (!isValidBigIntId(id)) {
        if (req.file) {
          await fs.promises.unlink(req.file.path).catch(() => {});
        }

        return res.status(400).json({
          success: false,
          message: "Invalid live class ID",
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Please select a presentation file",
        });
      }

      const classResult = await pool.query(
        `
        SELECT id
        FROM academy_live_classes
        WHERE id = $1::bigint
        LIMIT 1
        `,
        [id]
      );

      if (!classResult.rows.length) {
        await fs.promises.unlink(req.file.path).catch(() => {});

        return res.status(404).json({
          success: false,
          message: "Live class not found",
        });
      }

      uploadedFileUrl = getPresentationPublicUrl(
        req.file.filename
      );

      const client = await pool.connect();

      let previousFiles = [];

      try {
        await client.query("BEGIN");

        const oldResult = await client.query(
          `
          SELECT file_url
          FROM academy_live_resources
          WHERE live_class_id = $1::bigint
            AND LOWER(COALESCE(resource_type, '')) = 'presentation'
            AND COALESCE(is_active, TRUE) = TRUE
          FOR UPDATE
          `,
          [id]
        );

        previousFiles = oldResult.rows.map(
          (row) => row.file_url
        );

        await client.query(
          `
          UPDATE academy_live_resources
          SET
            is_active = FALSE,
            updated_at = NOW()
          WHERE live_class_id = $1::bigint
            AND LOWER(COALESCE(resource_type, '')) = 'presentation'
            AND COALESCE(is_active, TRUE) = TRUE
          `,
          [id]
        );

        const insertResult = await client.query(
          `
          INSERT INTO academy_live_resources (
            live_class_id,
            resource_type,
            title,
            file_url,
            current_page,
            is_active,
            created_at,
            updated_at,
            original_filename,
            file_size,
            total_pages
          )
          VALUES (
            $1::bigint,
            'presentation',
            $2,
            $3,
            1,
            TRUE,
            NOW(),
            NOW(),
            $4,
            $5,
            1
          )
          RETURNING *
          `,
          [
            id,
            req.file.originalname,
            uploadedFileUrl,
            req.file.originalname,
            req.file.size,
          ]
        );

        await client.query("COMMIT");

        const presentation = normalisePresentation(
          insertResult.rows[0]
        );

        /*
         * Remove old uploaded files only after the new
         * presentation has been saved successfully.
         */
        for (const oldUrl of previousFiles) {
          if (oldUrl && oldUrl !== uploadedFileUrl) {
            await removePresentationFile(oldUrl);
          }
        }

        return res.status(201).json({
          success: true,
          message: "Presentation uploaded successfully",
          presentation,
          data: presentation,
        });
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      if (req.file?.path) {
        await fs.promises.unlink(req.file.path).catch(() => {});
      }

      return sendError(
        res,
        error,
        "Failed to upload presentation"
      );
    }
  }
);

/*
 * Retrieve the active presentation.
 *
 * GET /api/academy/live-classes/:id/presentation
 */
router.get(
  "/live-classes/:id/presentation",
  async (req, res) => {
    try {
      const id = getSessionId(req);

      if (!isValidBigIntId(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid live class ID",
        });
      }

      const result = await pool.query(
        `
        SELECT *
        FROM academy_live_resources
        WHERE live_class_id = $1::bigint
          AND LOWER(COALESCE(resource_type, '')) = 'presentation'
          AND COALESCE(is_active, TRUE) = TRUE
        ORDER BY created_at DESC, id DESC
        LIMIT 1
        `,
        [id]
      );

      const presentation = normalisePresentation(
        result.rows[0] || null
      );

      return res.json({
        success: true,
        presentation,
        data: presentation,
      });
    } catch (error) {
      return sendError(
        res,
        error,
        "Failed to fetch presentation"
      );
    }
  }
);

/*
 * Save the current presentation page.
 *
 * PATCH /api/academy/live-classes/:id/presentation
 *
 * Body: { "currentPage": 3 }
 */
router.patch(
  "/live-classes/:id/presentation",
  async (req, res) => {
    try {
      const id = getSessionId(req);

      if (!isValidBigIntId(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid live class ID",
        });
      }

      const requestedPage = Number(
        req.body?.currentPage ??
          req.body?.current_page ??
          req.body?.page
      );

      if (
        !Number.isInteger(requestedPage) ||
        requestedPage < 1
      ) {
        return res.status(400).json({
          success: false,
          message: "A valid presentation page is required",
        });
      }

      const result = await pool.query(
        `
        UPDATE academy_live_resources
        SET
          current_page = LEAST(
            GREATEST($1, 1),
            GREATEST(COALESCE(total_pages, 1), 1)
          ),
          updated_at = NOW()
        WHERE id = (
          SELECT id
          FROM academy_live_resources
          WHERE live_class_id = $2::bigint
            AND LOWER(COALESCE(resource_type, '')) = 'presentation'
            AND COALESCE(is_active, TRUE) = TRUE
          ORDER BY created_at DESC, id DESC
          LIMIT 1
        )
        RETURNING *
        `,
        [requestedPage, id]
      );

      if (!result.rows.length) {
        return res.status(404).json({
          success: false,
          message: "No active presentation was found",
        });
      }

      const presentation = normalisePresentation(
        result.rows[0]
      );

      return res.json({
        success: true,
        message: "Presentation page updated",
        presentation,
        data: presentation,
      });
    } catch (error) {
      return sendError(
        res,
        error,
        "Failed to update presentation page"
      );
    }
  }
);

/*
 * Delete the active presentation and its uploaded file.
 *
 * DELETE /api/academy/live-classes/:id/presentation
 */
router.delete(
  "/live-classes/:id/presentation",
  async (req, res) => {
    try {
      const id = getSessionId(req);

      if (!isValidBigIntId(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid live class ID",
        });
      }

      const result = await pool.query(
        `
        UPDATE academy_live_resources
        SET
          is_active = FALSE,
          updated_at = NOW()
        WHERE id = (
          SELECT id
          FROM academy_live_resources
          WHERE live_class_id = $1::bigint
            AND LOWER(COALESCE(resource_type, '')) = 'presentation'
            AND COALESCE(is_active, TRUE) = TRUE
          ORDER BY created_at DESC, id DESC
          LIMIT 1
        )
        RETURNING *
        `,
        [id]
      );

      if (!result.rows.length) {
        return res.status(404).json({
          success: false,
          message: "No active presentation was found",
        });
      }

      await removePresentationFile(
        result.rows[0].file_url
      );

      return res.json({
        success: true,
        message: "Presentation removed successfully",
      });
    } catch (error) {
      return sendError(
        res,
        error,
        "Failed to remove presentation"
      );
    }
  }
);

/* =========================================================
   GET STUDENT LIVE CLASSES
========================================================= */

router.get("/student/live-classes", async (req, res) => {
  try {
    const student =
      await authenticateLiveClassStudent(req);

    const result = await pool.query(`
      SELECT
        c.*,
        COALESCE(
          (
            SELECT COUNT(*)
            FROM academy_live_participants p
            WHERE p.live_class_id = c.id
              AND p.is_present = TRUE
          ),
          0
        )::INTEGER AS participants
      FROM academy_live_classes c
      WHERE LOWER(COALESCE(c.status, 'scheduled'))
        IN (
          'scheduled',
          'upcoming',
          'live',
          'active',
          'ended',
          'completed'
        )
      ORDER BY
        COALESCE(c.scheduled_at, c.scheduled_start) DESC,
        c.id DESC
    `);

    const sessions = result.rows
      .filter((session) =>
        studentCanAccessSession(student, session)
      )
      .map((session) => {
        const normalised = normaliseSession(session);

        return {
          ...normalised,
          tutorName:
            normalised.tutor_name ||
            normalised.tutor_reference ||
            "Assigned Tutor",
          className:
            normalised.class_name ||
            normalised.grade,
          scheduledAt: normalised.scheduled_at,
          startedAt: normalised.started_at,
          endedAt: normalised.ended_at,
          roomCode: normalised.room_code,
          joinUrl: normalised.join_url,
        };
      });

    return res.json({
      success: true,
      sessions,
      data: sessions,
      student: {
        studentId: student.studentId,
        enrollmentId: student.enrollmentId,
        name: student.studentName,
        className: student.studentClass,
      },
    });
  } catch (error) {
    return sendError(
      res,
      error,
      "Failed to fetch student live classes"
    );
  }
});

/* =========================================================
   TUTOR LIVE CLASSES
========================================================= */

router.get("/tutor/live-classes", async (req, res) => {
  try {
    const tutorReference = getTutorReference(req);

    if (!tutorReference) {
      return res.status(400).json({
        success: false,
        message: "Tutor reference is required",
      });
    }

    const result = await pool.query(
      `
      SELECT *
      FROM academy_live_classes
      WHERE tutor_reference = $1
      ORDER BY
        COALESCE(scheduled_at, scheduled_start) DESC,
        id DESC
      `,
      [tutorReference]
    );

    const sessions = result.rows.map(normaliseSession);

    return res.json({
      success: true,
      sessions,
      data: sessions,
    });
  } catch (error) {
    return sendError(
      res,
      error,
      "Failed to fetch tutor live classes"
    );
  }
});

router.post("/tutor/live-classes", async (req, res) => {
  try {
    const body = req.body || {};
    const tutorReference = getTutorReference(req, body);

    if (!tutorReference) {
      return res.status(400).json({
        success: false,
        message: "Tutor reference is required",
      });
    }

    const finalTitle = clean(body.title) || "Live Class";
    const description = clean(body.description);

    const classId = clean(
      body.classId ||
        body.class_id ||
        body.grade_id ||
        body.gradeId
    );

    const className = clean(
      body.className ||
        body.class_name ||
        body.class ||
        body.gradeName ||
        body.grade_name
    );

    const subject = clean(
      body.subject ||
        body.subject_name ||
        body.subjectName
    );

    const grade = clean(
      body.grade ||
        body.className ||
        body.class_name ||
        body.class ||
        body.gradeName ||
        body.grade_name ||
        className
    );

    if (!grade || !classId || !subject) {
      return res.status(400).json({
        success: false,
        message: !grade
          ? "Grade/class is required"
          : !classId
            ? "Class is required"
            : "Subject is required",
      });
    }

    const scheduledValue =
      body.scheduledAt ||
      body.scheduled_at ||
      null;

    const scheduledDate = scheduledValue
      ? new Date(scheduledValue)
      : new Date(Date.now() + 30 * 60 * 1000);

    if (Number.isNaN(scheduledDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid scheduled date",
      });
    }

    const roomCode = makeRoomCode();
    const joinUrl = makeJoinUrl(roomCode);

    const result = await pool.query(
      `
      INSERT INTO academy_live_classes (
        tutor_reference,
        grade,
        subjects,
        title,
        description,
        status,
        scheduled_start,
        scheduled_at,
        room_id,
        room_code,
        join_url,
        meeting_url,
        class_id,
        class_name,
        subject,
        created_at,
        updated_at
      )
      VALUES (
        $1, $2, $3::jsonb, $4, $5,
        'scheduled', $6, $6, $7, $7, $8, $8,
        $9, $10, $11, NOW(), NOW()
      )
      RETURNING *
      `,
      [
        tutorReference,
        grade,
        JSON.stringify([subject]),
        finalTitle,
        description,
        scheduledDate.toISOString(),
        roomCode,
        joinUrl,
        classId,
        className || grade,
        subject,
      ]
    );

    const session = normaliseSession(result.rows[0]);

    return res.status(201).json({
      success: true,
      message: "Live class created successfully",
      session,
      data: session,
    });
  } catch (error) {
    return sendError(
      res,
      error,
      "Failed to create live class"
    );
  }
});

router.get("/tutor/live-classes/:id", async (req, res) => {
  try {
    const id = getSessionId(req);

    if (!isValidBigIntId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid live class ID",
      });
    }

    const result = await pool.query(
      `
      SELECT *
      FROM academy_live_classes
      WHERE id = $1::bigint
      LIMIT 1
      `,
      [id]
    );

    if (!result.rows.length) {
      return res.status(404).json({
        success: false,
        message: "Live class not found",
      });
    }

    const session = normaliseSession(result.rows[0]);

    return res.json({
      success: true,
      session,
      data: session,
    });
  } catch (error) {
    return sendError(res, error, "Failed to fetch live class");
  }
});

router.post(
  "/tutor/live-classes/:id/start",
  async (req, res) => {
    try {
      const id = getSessionId(req);

      if (!isValidBigIntId(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid live class ID",
        });
      }

      const result = await pool.query(
        `
        UPDATE academy_live_classes
        SET
          status = 'live',
          started_at = COALESCE(started_at, NOW()),
          actual_start = COALESCE(actual_start, NOW()),
          updated_at = NOW()
        WHERE id = $1::bigint
          AND LOWER(COALESCE(status, 'scheduled'))
            NOT IN ('ended', 'completed', 'cancelled')
        RETURNING *
        `,
        [id]
      );

      if (!result.rows.length) {
        return res.status(404).json({
          success: false,
          message: "Live class not found or has already ended",
        });
      }

      const session = normaliseSession(result.rows[0]);

      return res.json({
        success: true,
        message: "Live class started",
        session,
        data: session,
      });
    } catch (error) {
      return sendError(res, error, "Failed to start live class");
    }
  }
);

router.post(
  "/tutor/live-classes/:id/end",
  async (req, res) => {
    try {
      const id = getSessionId(req);

      if (!isValidBigIntId(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid live class ID",
        });
      }

      const result = await pool.query(
        `
        UPDATE academy_live_classes
        SET
          status = 'ended',
          ended_at = COALESCE(ended_at, NOW()),
          actual_end = COALESCE(actual_end, NOW()),
          duration_seconds = CASE
            WHEN COALESCE(started_at, actual_start) IS NOT NULL
            THEN GREATEST(
              0,
              EXTRACT(
                EPOCH FROM (
                  NOW() - COALESCE(started_at, actual_start)
                )
              )::INTEGER
            )
            ELSE duration_seconds
          END,
          updated_at = NOW()
        WHERE id = $1::bigint
        RETURNING *
        `,
        [id]
      );

      if (!result.rows.length) {
        return res.status(404).json({
          success: false,
          message: "Live class not found",
        });
      }

      const session = normaliseSession(result.rows[0]);

      return res.json({
        success: true,
        message: "Live class ended",
        session,
        data: session,
      });
    } catch (error) {
      return sendError(res, error, "Failed to end live class");
    }
  }
);

router.delete(
  "/tutor/live-classes/:id",
  async (req, res) => {
    const id = getSessionId(req);

    if (!isValidBigIntId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid live class ID",
      });
    }

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const presentationResult = await client.query(
        `
        SELECT file_url
        FROM academy_live_resources
        WHERE live_class_id = $1::bigint
          AND LOWER(COALESCE(resource_type, '')) = 'presentation'
        `,
        [id]
      );

      const childTables = [
        "academy_live_chat",
        "academy_live_participants",
        "academy_live_recordings",
        "academy_live_resources",
        "academy_live_whiteboard_events",
      ];

      for (const table of childTables) {
        await client.query(
          `DELETE FROM ${table} WHERE live_class_id = $1::bigint`,
          [id]
        );
      }

      const result = await client.query(
        `
        DELETE FROM academy_live_classes
        WHERE id = $1::bigint
        RETURNING *
        `,
        [id]
      );

      if (!result.rows.length) {
        await client.query("ROLLBACK");

        return res.status(404).json({
          success: false,
          message: "Live class not found",
        });
      }

      await client.query("COMMIT");

      for (const row of presentationResult.rows) {
        await removePresentationFile(row.file_url);
      }

      return res.json({
        success: true,
        message: "Live class deleted successfully",
      });
    } catch (error) {
      await client.query("ROLLBACK");

      return sendError(
        res,
        error,
        "Failed to delete live class"
      );
    } finally {
      client.release();
    }
  }
);

/* =========================================================
   JOIN LIVE CLASS
========================================================= */

router.post(
  "/live-classes/:id/join",
  async (req, res) => {
    try {
      const id = getSessionId(req);

      if (!isValidBigIntId(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid live class ID",
        });
      }

      const student =
        await authenticateLiveClassStudent(req);

      const classResult = await pool.query(
        `
        SELECT *
        FROM academy_live_classes
        WHERE id = $1::bigint
        LIMIT 1
        `,
        [id]
      );

      if (!classResult.rows.length) {
        return res.status(404).json({
          success: false,
          message: "Live class not found",
        });
      }

      const liveClass = classResult.rows[0];

      if (
        !["live", "active"].includes(
          clean(liveClass.status).toLowerCase()
        )
      ) {
        return res.status(409).json({
          success: false,
          code: "CLASS_NOT_LIVE",
          message:
            clean(liveClass.status).toLowerCase() === "ended"
              ? "This live class has already ended"
              : "The tutor has not started this class yet",
        });
      }

      if (!studentCanAccessSession(student, liveClass)) {
        return res.status(403).json({
          success: false,
          message:
            "You are not registered for this class or subject",
        });
      }

      const enrollmentId = student.enrollmentId;

      if (!enrollmentId) {
        return res.status(400).json({
          success: false,
          message: "Your enrollment ID could not be verified",
        });
      }

      let participantResult = await pool.query(
        `
        UPDATE academy_live_participants
        SET
          student_name = $1,
          role = 'student'
        WHERE live_class_id = $2::bigint
          AND enrollment_id = $3
          AND is_present = TRUE
        RETURNING *
        `,
        [
          student.studentName,
          id,
          enrollmentId,
        ]
      );

      if (!participantResult.rows.length) {
        participantResult = await pool.query(
          `
          INSERT INTO academy_live_participants (
            live_class_id,
            enrollment_id,
            student_name,
            role,
            joined_at,
            is_present,
            created_at
          )
          VALUES ($1::bigint, $2, $3, 'student', NOW(), TRUE, NOW())
          RETURNING *
          `,
          [
            id,
            enrollmentId,
            student.studentName,
          ]
        );
      }

      const session = normaliseSession(liveClass);

      return res.status(200).json({
        success: true,
        message: "Joined live class",
        participant: participantResult.rows[0],
        session,
        data: session,
      });
    } catch (error) {
      return sendError(res, error, "Failed to join live class");
    }
  }
);

/* =========================================================
   LEAVE LIVE CLASS
========================================================= */

router.post(
  "/live-classes/:id/leave",
  async (req, res) => {
    try {
      const id = getSessionId(req);

      if (!isValidBigIntId(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid live class ID",
        });
      }

      const student =
        await authenticateLiveClassStudent(req);

      const result = await pool.query(
        `
        UPDATE academy_live_participants
        SET
          is_present = FALSE,
          left_at = NOW(),
          total_seconds = CASE
            WHEN joined_at IS NOT NULL
            THEN GREATEST(
              0,
              EXTRACT(EPOCH FROM (NOW() - joined_at))::INTEGER
            )
            ELSE total_seconds
          END
        WHERE live_class_id = $1::bigint
          AND enrollment_id = $2
          AND is_present = TRUE
        RETURNING *
        `,
        [id, student.enrollmentId]
      );

      if (!result.rows.length) {
        return res.status(404).json({
          success: false,
          message: "Active participant record not found",
        });
      }

      return res.json({
        success: true,
        message: "Left live class",
        participant: result.rows[0],
      });
    } catch (error) {
      return sendError(res, error, "Failed to leave live class");
    }
  }
);

/* =========================================================
   PARTICIPANTS
========================================================= */

router.get(
  "/live-classes/:id/participants",
  async (req, res) => {
    try {
      const id = getSessionId(req);

      if (!isValidBigIntId(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid live class ID",
        });
      }

      const result = await pool.query(
        `
        SELECT
          id,
          live_class_id,
          enrollment_id,
          student_name,
          role,
          joined_at,
          left_at,
          is_present,
          total_seconds,
          created_at
        FROM academy_live_participants
        WHERE live_class_id = $1::bigint
        ORDER BY joined_at ASC, id ASC
        `,
        [id]
      );

      return res.json({
        success: true,
        participants: result.rows,
        data: result.rows,
      });
    } catch (error) {
      return sendError(res, error, "Failed to fetch participants");
    }
  }
);

/* =========================================================
   ATTENDANCE
========================================================= */

router.get(
  "/live-classes/:id/attendance",
  async (req, res) => {
    try {
      const id = getSessionId(req);

      if (!isValidBigIntId(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid live class ID",
        });
      }

      const result = await pool.query(
        `
        SELECT
          enrollment_id,
          student_name,
          role,
          MIN(joined_at) AS first_joined_at,
          MAX(left_at) AS last_left_at,
          SUM(COALESCE(total_seconds, 0))::INTEGER AS total_seconds,
          BOOL_OR(COALESCE(is_present, FALSE)) AS is_present
        FROM academy_live_participants
        WHERE live_class_id = $1::bigint
        GROUP BY enrollment_id, student_name, role
        ORDER BY student_name ASC
        `,
        [id]
      );

      return res.json({
        success: true,
        attendance: result.rows,
        data: result.rows,
      });
    } catch (error) {
      return sendError(res, error, "Failed to fetch attendance");
    }
  }
);

/* =========================================================
   CHAT
========================================================= */

router.get(
  "/live-classes/:id/chat",
  async (req, res) => {
    try {
      const id = getSessionId(req);

      if (!isValidBigIntId(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid live class ID",
        });
      }

      const result = await pool.query(
        `
        SELECT
          id,
          live_class_id,
          sender_id,
          sender_name,
          sender_role,
          message,
          created_at
        FROM academy_live_chat
        WHERE live_class_id = $1::bigint
        ORDER BY created_at ASC, id ASC
        `,
        [id]
      );

      return res.json({
        success: true,
        messages: result.rows,
        chat: result.rows,
        data: result.rows,
      });
    } catch (error) {
      return sendError(res, error, "Failed to fetch live chat");
    }
  }
);

router.post(
  "/live-classes/:id/chat",
  async (req, res) => {
    try {
      const id = getSessionId(req);

      if (!isValidBigIntId(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid live class ID",
        });
      }

      const body = req.body || {};
      const message = clean(body.message);

      if (!message) {
        return res.status(400).json({
          success: false,
          message: "Message is required",
        });
      }

      if (message.length > 5000) {
        return res.status(400).json({
          success: false,
          message: "Message is too long",
        });
      }

      const senderId = clean(
        body.senderId ||
          body.sender_id ||
          body.userId ||
          body.user_id
      );

      const senderName =
        clean(
          body.senderName ||
            body.sender_name ||
            body.name
        ) || "User";

      const senderRole =
        clean(
          body.senderRole ||
            body.sender_role ||
            body.role
        ) || "student";

      const result = await pool.query(
        `
        INSERT INTO academy_live_chat (
          live_class_id,
          sender_id,
          sender_name,
          sender_role,
          message,
          created_at
        )
        VALUES ($1::bigint, $2, $3, $4, $5, NOW())
        RETURNING *
        `,
        [
          id,
          senderId,
          senderName,
          senderRole,
          message,
        ]
      );

      return res.status(201).json({
        success: true,
        message: "Message sent",
        chat: result.rows[0],
        data: result.rows[0],
      });
    } catch (error) {
      return sendError(res, error, "Failed to send chat message");
    }
  }
);

/* =========================================================
   WHITEBOARD
========================================================= */

router.post(
  "/live-classes/:id/whiteboard",
  async (req, res) => {
    try {
      const id = getSessionId(req);

      if (!isValidBigIntId(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid live class ID",
        });
      }

      const body = req.body || {};

      const payload =
        body.payload ??
        body.content ??
        body.state ??
        body;

      const result = await pool.query(
        `
        INSERT INTO academy_live_whiteboard_events (
          live_class_id,
          event_type,
          payload,
          created_at
        )
        VALUES ($1::bigint, 'state', $2::jsonb, NOW())
        RETURNING *
        `,
        [
          id,
          JSON.stringify(payload),
        ]
      );

      return res.status(201).json({
        success: true,
        message: "Whiteboard state saved",
        event: result.rows[0],
        data: result.rows[0],
      });
    } catch (error) {
      return sendError(res, error, "Failed to save whiteboard");
    }
  }
);

router.get(
  "/live-classes/:id/whiteboard",
  async (req, res) => {
    try {
      const id = getSessionId(req);

      if (!isValidBigIntId(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid live class ID",
        });
      }

      const result = await pool.query(
        `
        SELECT *
        FROM academy_live_whiteboard_events
        WHERE live_class_id = $1::bigint
        ORDER BY created_at DESC, id DESC
        LIMIT 1
        `,
        [id]
      );

      const row = result.rows[0] || null;

      return res.json({
        success: true,
        whiteboard: row ? row.payload : null,
        event: row,
        data: row ? row.payload : null,
      });
    } catch (error) {
      return sendError(res, error, "Failed to fetch whiteboard");
    }
  }
);

/* =========================================================
   RESOURCES
========================================================= */

router.post(
  "/live-classes/:id/resources",
  async (req, res) => {
    try {
      const id = getSessionId(req);

      if (!isValidBigIntId(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid live class ID",
        });
      }

      const body = req.body || {};

      const resourceType =
        clean(
          body.resourceType ||
            body.resource_type
        ) || "file";

      const title = clean(body.title) || "Resource";

      const fileUrl = clean(
        body.fileUrl ||
          body.file_url ||
          body.url
      );

      const currentPage =
        Number(
          body.currentPage ??
            body.current_page ??
            1
        ) || 1;

      const result = await pool.query(
        `
        INSERT INTO academy_live_resources (
          live_class_id,
          resource_type,
          title,
          file_url,
          current_page,
          is_active,
          created_at,
          updated_at
        )
        VALUES ($1::bigint, $2, $3, $4, $5, TRUE, NOW(), NOW())
        RETURNING *
        `,
        [
          id,
          resourceType,
          title,
          fileUrl,
          currentPage,
        ]
      );

      return res.status(201).json({
        success: true,
        message: "Resource added",
        resource: result.rows[0],
        data: result.rows[0],
      });
    } catch (error) {
      return sendError(res, error, "Failed to add resource");
    }
  }
);

router.get(
  "/live-classes/:id/resources",
  async (req, res) => {
    try {
      const id = getSessionId(req);

      if (!isValidBigIntId(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid live class ID",
        });
      }

      const result = await pool.query(
        `
        SELECT *
        FROM academy_live_resources
        WHERE live_class_id = $1::bigint
          AND COALESCE(is_active, TRUE) = TRUE
        ORDER BY created_at ASC, id ASC
        `,
        [id]
      );

      return res.json({
        success: true,
        resources: result.rows,
        data: result.rows,
      });
    } catch (error) {
      return sendError(res, error, "Failed to fetch resources");
    }
  }
);

/* =========================================================
   RECORDING
========================================================= */

router.post(
  "/live-classes/:id/recording",
  async (req, res) => {
    try {
      const id = getSessionId(req);

      if (!isValidBigIntId(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid live class ID",
        });
      }

      const body = req.body || {};

      const recordingUrl = clean(
        body.recordingUrl ||
          body.recording_url
      );

      const recordingStatus =
        clean(
          body.status ||
            body.recordingStatus ||
            body.recording_status
        ) ||
        (recordingUrl ? "completed" : "processing");

      const duration =
        Number(
          body.durationSeconds ??
            body.duration_seconds ??
            body.recordingDuration ??
            body.recording_duration ??
            0
        ) || 0;

      const result = await pool.query(
        `
        UPDATE academy_live_classes
        SET
          recording_url = $1,
          recording_status = $2,
          recording_duration = $3,
          duration_seconds = $3,
          updated_at = NOW()
        WHERE id = $4::bigint
        RETURNING *
        `,
        [
          recordingUrl,
          recordingStatus,
          duration,
          id,
        ]
      );

      if (!result.rows.length) {
        return res.status(404).json({
          success: false,
          message: "Live class not found",
        });
      }

      const session = normaliseSession(result.rows[0]);

      return res.json({
        success: true,
        message: "Recording information updated",
        session,
        data: session,
      });
    } catch (error) {
      return sendError(res, error, "Failed to update recording");
    }
  }
);

router.get(
  "/tutor/live-recordings",
  async (req, res) => {
    try {
      const tutorReference = getTutorReference(req);

      if (!tutorReference) {
        return res.status(400).json({
          success: false,
          message: "Tutor reference is required",
        });
      }

      const result = await pool.query(
        `
        SELECT
          r.*,
          c.title AS live_class_title
        FROM academy_live_recordings r
        LEFT JOIN academy_live_classes c
          ON c.id = r.live_class_id
        WHERE r.tutor_reference = $1
        ORDER BY r.created_at DESC, r.id DESC
        `,
        [tutorReference]
      );

      return res.json({
        success: true,
        recordings: result.rows,
        data: result.rows,
      });
    } catch (error) {
      return sendError(res, error, "Failed to fetch recordings");
    }
  }
);

/* =========================================================
   GET LIVE CLASS BY ROOM CODE
========================================================= */

const getLiveClassByRoom = async (req, res) => {
  try {
    const suppliedRoomValue = clean(
      req.params.roomCode ||
        req.params.roomId
    );

    if (!suppliedRoomValue) {
      return res.status(400).json({
        success: false,
        message: "Room code is required",
      });
    }

    let roomCode = suppliedRoomValue;

    try {
      if (
        suppliedRoomValue.startsWith("http://") ||
        suppliedRoomValue.startsWith("https://")
      ) {
        const parsedUrl = new URL(suppliedRoomValue);

        const pathParts = parsedUrl.pathname
          .split("/")
          .filter(Boolean);

        roomCode = pathParts[pathParts.length - 1] || "";
      }
    } catch {
      roomCode = suppliedRoomValue;
    }

    roomCode = clean(decodeURIComponent(roomCode));

    if (!roomCode) {
      return res.status(400).json({
        success: false,
        message: "A valid room code is required",
      });
    }

    const normalizedCode = roomCode.toUpperCase();
    const numericId = isValidBigIntId(roomCode);

    const result = await pool.query(
      `
      SELECT *
      FROM academy_live_classes c
      WHERE
        UPPER(TRIM(COALESCE(c.room_code, ''))) = $1
        OR UPPER(TRIM(COALESCE(c.room_id, ''))) = $1
        OR (
          $2::boolean = TRUE
          AND c.id = $3::bigint
        )
        OR TRIM(COALESCE(c.join_url, '')) = $4
        OR TRIM(COALESCE(c.meeting_url, '')) = $4
      ORDER BY c.id DESC
      LIMIT 1
      `,
      [
        normalizedCode,
        numericId,
        numericId ? roomCode : "0",
        suppliedRoomValue,
      ]
    );

    if (!result.rows.length) {
      return res.status(404).json({
        success: false,
        code: "LIVE_CLASS_NOT_FOUND",
        message: "Live class room not found",
      });
    }

    const session = normaliseSession(result.rows[0]);

    return res.json({
      success: true,
      message: "Live class room found",
      session,
      data: session,
      classroom: session,
    });
  } catch (error) {
    console.error("GET room live class error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch live class room",
      error: error.message,
    });
  }
};

router.get(
  "/live-class/room/:roomCode",
  getLiveClassByRoom
);

router.get(
  "/live-classes/room/:roomCode",
  getLiveClassByRoom
);

/* =========================================================
   EXPORT
========================================================= */

export default router;