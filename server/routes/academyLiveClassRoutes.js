
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
const MAX_WHITEBOARD_SIZE = 20 * 1024 * 1024;

const ALLOWED_PRESENTATION_EXTENSIONS = [".pdf", ".ppt", ".pptx"];

const ALLOWED_PRESENTATION_MIMES = [
  "application/pdf",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/octet-stream",
];

const VALID_CLASSROOM_STAGES = [
  "video",
  "whiteboard",
  "presentation",
  "material",
];

const VALID_RESOURCE_TYPES = [
  "document",
  "link",
  "image",
  "video",
  "presentation",
  "file",
  "pdf",
  "audio",
];

const RESOURCE_TYPE_ALIASES = {
  doc: "document",
  docx: "document",
  worksheet: "document",
  notes: "document",
  word: "document",
  ppt: "presentation",
  pptx: "presentation",
  powerpoint: "presentation",
  slides: "presentation",
  mp4: "video",
  webm: "video",
  mov: "video",
  mp3: "audio",
  wav: "audio",
  m4a: "audio",
  url: "link",
  website: "link",
  webpage: "link",
  jpg: "image",
  jpeg: "image",
  png: "image",
  gif: "image",
  webp: "image",
};

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

const normaliseResourceType = (value) => {
  const suppliedType = clean(value).toLowerCase();

  if (!suppliedType) return "file";

  const normalisedType =
    RESOURCE_TYPE_ALIASES[suppliedType] || suppliedType;

  return VALID_RESOURCE_TYPES.includes(normalisedType)
    ? normalisedType
    : null;
};

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

const parseJsonObject = (value, fallback = {}) => {
  if (value === undefined || value === null) return fallback;
  if (typeof value === "object") return value;

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);

      return parsed && typeof parsed === "object"
        ? parsed
        : fallback;
    } catch {
      return fallback;
    }
  }

  return fallback;
};

const normaliseStage = (value) => {
  const stage = clean(value).toLowerCase();

  return VALID_CLASSROOM_STAGES.includes(stage)
    ? stage
    : "video";
};

const normaliseSession = (row) => {
  if (!row) return null;

  const roomCode = clean(row.room_code) || clean(row.room_id);
  const joinUrl = clean(row.join_url) || clean(row.meeting_url);
  const stage = normaliseStage(row.stage);
  const stageState = parseJsonObject(row.stage_state, {});

  return {
    id: row.id,
    title: row.title || "Live Class",
    description: row.description || "",
    tutor_reference: row.tutor_reference || "",
    tutor_name:
      row.tutor_name || row.tutor_reference || "Assigned Tutor",
    grade: row.grade || "",
    class_id: row.class_id || "",
    class_name: row.class_name || row.grade || "",
    subject: row.subject || "",
    scheduled_at: row.scheduled_at || row.scheduled_start || null,
    scheduled_start: row.scheduled_start || row.scheduled_at || null,
    started_at: row.started_at || row.actual_start || null,
    actual_start: row.actual_start || row.started_at || null,
    ended_at: row.ended_at || row.actual_end || null,
    actual_end: row.actual_end || row.ended_at || null,
    status: row.status || "scheduled",
    room_id: roomCode,
    room_code: roomCode,
    join_url: joinUrl,
    meeting_url: joinUrl,
    recording_status: row.recording_status || "",
    recording_url: row.recording_url || "",
    recording_duration:
      row.recording_duration ?? row.duration_seconds ?? null,
    duration_seconds:
      row.duration_seconds ?? row.recording_duration ?? null,
    subjects: row.subjects || null,
    participants: Number(row.participants || 0),
    stage,
    stageMode: stage,
    activeStage: stage,
    active_stage: stage,
    stage_state: stageState,
    stageState,
    created_at: row.created_at || null,
    updated_at: row.updated_at || null,
  };
};

const sendError = (res, error, fallbackMessage) => {
  console.error(`\n${fallbackMessage}`);

  console.error({
    message: error?.message,
    code: error?.code,
    detail: error?.detail,
    table: error?.table,
    column: error?.column,
    constraint: error?.constraint,
    stack: error?.stack,
  });

  const response = {
    success: false,
    message: error?.message || fallbackMessage,
  };

  if (process.env.NODE_ENV !== "production") {
    response.code = error?.code || null;
    response.detail = error?.detail || null;
    response.table = error?.table || null;
    response.column = error?.column || null;
    response.constraint = error?.constraint || null;
  }

  return res.status(error?.status || 500).json(response);
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

    callback(null, `${crypto.randomUUID()}${extension}`);
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
      const error = new Error("Unsupported presentation file type");

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
      return res.status(400).json({
        success: false,
        message:
          error.code === "LIMIT_FILE_SIZE"
            ? "Presentation file must not exceed 50MB"
            : error.message,
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
    const pathname =
      value.startsWith("http://") || value.startsWith("https://")
        ? new URL(value).pathname
        : value;

    const prefix = "/uploads/live-presentations/";

    if (!pathname.startsWith(prefix)) return "";

    const filename = path.basename(
      decodeURIComponent(pathname.slice(prefix.length))
    );

    return !filename || filename === "." || filename === ".."
      ? ""
      : filename;
  } catch {
    return "";
  }
};

const removePresentationFile = async (fileUrl) => {
  const filename = getPresentationFilenameFromUrl(fileUrl);

  if (!filename) return;

  const filePath = path.resolve(UPLOAD_DIRECTORY, filename);

  if (!filePath.startsWith(`${UPLOAD_DIRECTORY}${path.sep}`)) return;

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
    original_filename: row.original_filename || row.title || "Presentation",
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
      recording_duration INTEGER,
      stage TEXT DEFAULT 'video',
      stage_state JSONB DEFAULT '{}'::jsonb
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
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW(),
      ADD COLUMN IF NOT EXISTS stage TEXT DEFAULT 'video',
      ADD COLUMN IF NOT EXISTS stage_state JSONB DEFAULT '{}'::jsonb
  `);

  await pool.query(`
    UPDATE academy_live_classes
    SET
      stage = COALESCE(NULLIF(stage, ''), 'video'),
      stage_state = COALESCE(stage_state, '{}'::jsonb)
    WHERE stage IS NULL OR stage = '' OR stage_state IS NULL
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
      event_type TEXT DEFAULT 'state',
      payload JSONB,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await pool.query(`
    ALTER TABLE academy_live_whiteboard_events
      ADD COLUMN IF NOT EXISTS live_class_id BIGINT,
      ADD COLUMN IF NOT EXISTS event_type TEXT DEFAULT 'state',
      ADD COLUMN IF NOT EXISTS payload JSONB,
      ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW()
  `);

  await pool.query(`
    UPDATE academy_live_whiteboard_events
    SET
      event_type = COALESCE(NULLIF(event_type, ''), 'state'),
      created_at = COALESCE(created_at, NOW())
    WHERE event_type IS NULL
       OR event_type = ''
       OR created_at IS NULL
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

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_live_whiteboard_class
    ON academy_live_whiteboard_events (
      live_class_id,
      created_at DESC,
      id DESC
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
    next();
  } catch (error) {
    console.error("Live class database setup error:", error);

    return res.status(500).json({
      success: false,
      message: "Live class database is not ready",
      error:
        process.env.NODE_ENV === "production"
          ? undefined
          : error.message,
      code:
        process.env.NODE_ENV === "production"
          ? undefined
          : error.code,
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
    !["student", "academy_student", "academystudent"].includes(userType)
  ) {
    const error = new Error("A valid student account is required");
    error.status = 403;
    throw error;
  }

  const auth = await resolveAuthenticatedStudent(req);

  if (!auth || !auth.student || !auth.serialized) {
    const error = new Error("Student enrollment could not be verified");
    error.status = 401;
    throw error;
  }

  const serialized = auth.serialized;

  const tokenStudentId = clean(
    decoded.studentId || decoded.student_id || decoded.id
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
      tokenEmail && resolvedEmail && tokenEmail === resolvedEmail
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
  const sessionClass = clean(session.class_name) || clean(session.grade);

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
      subjectsMatch(clean(studentSubject), clean(sessionSubject))
    )
  );
};

/* =========================================================
   CLASSROOM STATE
========================================================= */

router.get("/live-classes/:id/state", async (req, res) => {
  try {
    const id = getSessionId(req);

    if (!isValidBigIntId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid live class ID",
      });
    }

    const classResult = await pool.query(
      `
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
      WHERE c.id = $1::bigint
      LIMIT 1
      `,
      [id]
    );

    if (!classResult.rows.length) {
      return res.status(404).json({
        success: false,
        code: "LIVE_CLASS_NOT_FOUND",
        message: "Live class not found",
      });
    }

    const [whiteboardResult, presentationResult, resourcesResult] =
      await Promise.all([
        pool.query(
          `
          SELECT *
          FROM academy_live_whiteboard_events
          WHERE live_class_id = $1::bigint
          ORDER BY created_at DESC NULLS LAST, id DESC
          LIMIT 1
          `,
          [id]
        ),
        pool.query(
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
        ),
        pool.query(
          `
          SELECT *
          FROM academy_live_resources
          WHERE live_class_id = $1::bigint
            AND COALESCE(is_active, TRUE) = TRUE
          ORDER BY created_at ASC, id ASC
          `,
          [id]
        ),
      ]);

    const session = normaliseSession(classResult.rows[0]);
    const whiteboardRow = whiteboardResult.rows[0] || null;
    const whiteboard = whiteboardRow?.payload ?? null;

    const presentation = normalisePresentation(
      presentationResult.rows[0] || null
    );

    const resources = resourcesResult.rows.map((resource) => {
      if (
        clean(resource.resource_type).toLowerCase() === "presentation"
      ) {
        return {
          ...resource,
          ...normalisePresentation(resource),
          resource_type: "presentation",
        };
      }

      return resource;
    });

    const activeMaterial =
      resources
        .filter((resource) => {
          const type = clean(resource.resource_type).toLowerCase();

          return (
            resource.is_active !== false &&
            type !== "presentation"
          );
        })
        .slice(-1)[0] || null;

    const stage = session.stage;
    const stageState = session.stage_state || {};

    const state = {
      id: session.id,
      session,
      classroom: session,
      class: session,
      stage,
      stageMode: stage,
      activeStage: stage,
      active_stage: stage,
      stageState,
      stage_state: stageState,
      whiteboard,
      whiteboardState: whiteboard,
      whiteboard_state: whiteboard,
      whiteboardEvent: whiteboardRow,
      whiteboard_event: whiteboardRow,
      presentation,
      activePresentation: presentation,
      active_presentation: presentation,
      activeMaterial,
      active_material: activeMaterial,
      resources,
    };

    return res.json({
      success: true,
      state,
      classroom: session,
      session,
      data: state,
      stage,
      stageMode: stage,
      activeStage: stage,
      active_stage: stage,
      stageState,
      stage_state: stageState,
      whiteboard,
      presentation,
      resources,
      activeMaterial,
    });
  } catch (error) {
    return sendError(res, error, "Failed to fetch live classroom state");
  }
});

router.patch("/live-classes/:id/stage", async (req, res) => {
  try {
    const id = getSessionId(req);

    if (!isValidBigIntId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid live class ID",
      });
    }

    const body = req.body || {};

    const requestedStage =
      body.stage ??
      body.stageMode ??
      body.stage_mode ??
      body.activeStage ??
      body.active_stage;

    if (!clean(requestedStage)) {
      return res.status(400).json({
        success: false,
        message: "Classroom stage is required",
        allowedStages: VALID_CLASSROOM_STAGES,
      });
    }

    const stage = clean(requestedStage).toLowerCase();

    if (!VALID_CLASSROOM_STAGES.includes(stage)) {
      return res.status(400).json({
        success: false,
        message: "Invalid classroom stage",
        allowedStages: VALID_CLASSROOM_STAGES,
      });
    }

    const suppliedStageState =
      body.stageState ?? body.stage_state ?? body.state;

    const stageState =
      suppliedStageState === undefined
        ? null
        : parseJsonObject(suppliedStageState, {});

    const result = await pool.query(
      `
      UPDATE academy_live_classes
      SET
        stage = $1,
        stage_state = CASE
          WHEN $2::jsonb IS NULL THEN
            COALESCE(stage_state, '{}'::jsonb)
          ELSE $2::jsonb
        END,
        updated_at = NOW()
      WHERE id = $3::bigint
      RETURNING *
      `,
      [
        stage,
        stageState === null ? null : JSON.stringify(stageState),
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
      message: "Classroom stage updated",
      stage: session.stage,
      stageMode: session.stage,
      activeStage: session.stage,
      active_stage: session.stage,
      stageState: session.stage_state,
      stage_state: session.stage_state,
      session,
      classroom: session,
      data: session,
    });
  } catch (error) {
    return sendError(res, error, "Failed to update classroom stage");
  }
});

/* =========================================================
   PRESENTATION ROUTES
========================================================= */

router.post(
  "/live-classes/:id/presentation",
  handlePresentationUpload,
  async (req, res) => {
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

      const uploadedFileUrl = getPresentationPublicUrl(
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

        previousFiles = oldResult.rows.map((row) => row.file_url);

        await client.query(
          `
          UPDATE academy_live_resources
          SET is_active = FALSE, updated_at = NOW()
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
          VALUES ($1::bigint, 'presentation', $2, $3, 1, TRUE, NOW(), NOW(), $4, $5, 1)
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

        await client.query(
          `
          UPDATE academy_live_classes
          SET stage = 'presentation', updated_at = NOW()
          WHERE id = $1::bigint
          `,
          [id]
        );

        await client.query("COMMIT");

        const presentation = normalisePresentation(
          insertResult.rows[0]
        );

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

      return sendError(res, error, "Failed to upload presentation");
    }
  }
);

router.get("/live-classes/:id/presentation", async (req, res) => {
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

    const presentation = normalisePresentation(result.rows[0] || null);

    return res.json({
      success: true,
      presentation,
      data: presentation,
    });
  } catch (error) {
    return sendError(res, error, "Failed to fetch presentation");
  }
});

router.patch("/live-classes/:id/presentation", async (req, res) => {
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

    if (!Number.isInteger(requestedPage) || requestedPage < 1) {
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

    const presentation = normalisePresentation(result.rows[0]);

    return res.json({
      success: true,
      message: "Presentation page updated",
      presentation,
      data: presentation,
    });
  } catch (error) {
    return sendError(res, error, "Failed to update presentation page");
  }
});

router.delete("/live-classes/:id/presentation", async (req, res) => {
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
      SET is_active = FALSE, updated_at = NOW()
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

    await removePresentationFile(result.rows[0].file_url);

    return res.json({
      success: true,
      message: "Presentation removed successfully",
    });
  } catch (error) {
    return sendError(res, error, "Failed to remove presentation");
  }
});

/* =========================================================
   GET STUDENT LIVE CLASSES
========================================================= */

router.get("/student/live-classes", async (req, res) => {
  try {
    const student = await authenticateLiveClassStudent(req);

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
        IN ('scheduled', 'upcoming', 'live', 'active', 'ended', 'completed')
      ORDER BY COALESCE(c.scheduled_at, c.scheduled_start) DESC, c.id DESC
    `);

    const sessions = result.rows
      .filter((session) => studentCanAccessSession(student, session))
      .map((session) => {
        const normalised = normaliseSession(session);

        return {
          ...normalised,
          tutorName:
            normalised.tutor_name ||
            normalised.tutor_reference ||
            "Assigned Tutor",
          className: normalised.class_name || normalised.grade,
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
    return sendError(res, error, "Failed to fetch student live classes");
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
      ORDER BY COALESCE(scheduled_at, scheduled_start) DESC, id DESC
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
    return sendError(res, error, "Failed to fetch tutor live classes");
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

    const scheduledValue = body.scheduledAt || body.scheduled_at || null;

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
        stage,
        stage_state,
        created_at,
        updated_at
      )
      VALUES (
        $1, $2, $3::jsonb, $4, $5,
        'scheduled', $6, $6, $7, $7, $8, $8,
        $9, $10, $11, 'video', '{}'::jsonb, NOW(), NOW()
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
    return sendError(res, error, "Failed to create live class");
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
      `SELECT * FROM academy_live_classes WHERE id = $1::bigint LIMIT 1`,
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

router.post("/tutor/live-classes/:id/start", async (req, res) => {
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
});

router.post("/tutor/live-classes/:id/end", async (req, res) => {
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
            EXTRACT(EPOCH FROM (
              NOW() - COALESCE(started_at, actual_start)
            ))::INTEGER
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
});

router.delete("/tutor/live-classes/:id", async (req, res) => {
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
    return sendError(res, error, "Failed to delete live class");
  } finally {
    client.release();
  }
});

/* =========================================================
   JOIN LIVE CLASS
========================================================= */

router.post("/live-classes/:id/join", async (req, res) => {
  try {
    const id = getSessionId(req);

    if (!isValidBigIntId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid live class ID",
      });
    }

    const student = await authenticateLiveClassStudent(req);

    const classResult = await pool.query(
      `SELECT * FROM academy_live_classes WHERE id = $1::bigint LIMIT 1`,
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
        message: "You are not registered for this class or subject",
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
      SET student_name = $1, role = 'student'
      WHERE live_class_id = $2::bigint
        AND enrollment_id = $3
        AND is_present = TRUE
      RETURNING *
      `,
      [student.studentName, id, enrollmentId]
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
        [id, enrollmentId, student.studentName]
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
});

/* =========================================================
   LEAVE LIVE CLASS
========================================================= */

router.post("/live-classes/:id/leave", async (req, res) => {
  try {
    const id = getSessionId(req);

    if (!isValidBigIntId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid live class ID",
      });
    }

    const student = await authenticateLiveClassStudent(req);

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
});

/* =========================================================
   PARTICIPANTS
========================================================= */

router.get("/live-classes/:id/participants", async (req, res) => {
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
});

/* =========================================================
   ATTENDANCE
========================================================= */

router.get("/live-classes/:id/attendance", async (req, res) => {
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
});

/* =========================================================
   CHAT
========================================================= */

router.get("/live-classes/:id/chat", async (req, res) => {
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
});

router.post("/live-classes/:id/chat", async (req, res) => {
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
      clean(body.senderName || body.sender_name || body.name) || "User";

    const senderRole =
      clean(body.senderRole || body.sender_role || body.role) || "student";

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
      [id, senderId, senderName, senderRole, message]
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
});

/* =========================================================
   WHITEBOARD - SAVE, BROADCAST AND LOAD
========================================================= */

router.post("/live-classes/:id/whiteboard", async (req, res) => {
  try {
    const id = getSessionId(req);

    if (!isValidBigIntId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid live class ID",
      });
    }

    const body = req.body || {};

    let payload =
      body.payload ??
      body.content ??
      body.state ??
      null;

    if (payload === null && body.image) {
      payload = { image: body.image };
    }

    if (
      payload === null &&
      Object.keys(body).length > 0
    ) {
      payload = body;
    }

    if (payload === null || payload === undefined) {
      return res.status(400).json({
        success: false,
        message: "Whiteboard payload is required",
      });
    }

    if (
      typeof payload !== "object" &&
      typeof payload !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid whiteboard payload",
      });
    }

    let serializedPayload;

    try {
      serializedPayload = JSON.stringify(payload);
    } catch {
      return res.status(400).json({
        success: false,
        message: "Whiteboard payload could not be serialized",
      });
    }

    if (!serializedPayload) {
      return res.status(400).json({
        success: false,
        message: "Whiteboard payload is empty",
      });
    }

    const payloadSize = Buffer.byteLength(
      serializedPayload,
      "utf8"
    );

    if (payloadSize > MAX_WHITEBOARD_SIZE) {
      return res.status(413).json({
        success: false,
        message:
          "Whiteboard image is too large. Maximum size is 20MB.",
      });
    }

    const eventType =
      clean(body.eventType || body.event_type) || "state";

    // Confirm that the classroom exists.
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
      return res.status(404).json({
        success: false,
        message: "Live class not found",
      });
    }

    // Save the whiteboard image/state in Neon.
    const result = await pool.query(
      `
      INSERT INTO academy_live_whiteboard_events (
        live_class_id,
        event_type,
        payload,
        created_at
      )
      VALUES ($1::bigint, $2, $3::jsonb, NOW())
      RETURNING
        id,
        live_class_id,
        event_type,
        payload,
        created_at
      `,
      [id, eventType, serializedPayload]
    );

    const savedEvent = result.rows[0];
    const savedWhiteboard = savedEvent.payload;

    // Get the existing Socket.IO server instance.
    const io = req.app.get("io");

    // Must match the room name used by live:join.
    const room = `scholiqen-live-${String(id)}`;

    const broadcastData = {
      success: true,

      classId: String(id),
      liveClassId: String(id),
      live_class_id: String(id),

      eventType,
      event_type: eventType,

      event: savedEvent,

      whiteboard: savedWhiteboard,
      payload: savedWhiteboard,
      drawing: savedWhiteboard,
      state: savedWhiteboard,

      updatedAt: savedEvent.created_at,
      created_at: savedEvent.created_at,
    };

    if (io) {
      // Send the complete saved board to connected students.
      io.to(room).emit(
        "live:whiteboard-update",
        broadcastData
      );

      // Notify any classroom stage listeners.
      io.to(room).emit(
        "live:stage-update",
        {
          classId: String(id),
          liveClassId: String(id),
          stage: "whiteboard",
          activeStage: "whiteboard",
          whiteboard: savedWhiteboard,
          payload: savedWhiteboard,
        }
      );

      console.log(
        `Whiteboard broadcast sent to ${room}`
      );
    } else {
      console.warn(
        "Socket.IO instance was not found on Express app. Whiteboard was saved but not broadcast."
      );
    }

    return res.status(201).json({
      success: true,
      message: "Whiteboard saved and broadcast successfully",

      event: savedEvent,

      whiteboard: savedWhiteboard,
      payload: savedWhiteboard,
      drawing: savedWhiteboard,

      data: savedEvent,
    });
  } catch (error) {
    console.error("WHITEBOARD SAVE DATABASE ERROR", {
      message: error?.message,
      code: error?.code,
      detail: error?.detail,
      table: error?.table,
      column: error?.column,
      constraint: error?.constraint,
      stack: error?.stack,
    });

    return sendError(
      res,
      error,
      "Unable to save whiteboard event"
    );
  }
});

router.get("/live-classes/:id/whiteboard", async (req, res) => {
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
        event_type,
        payload,
        created_at
      FROM academy_live_whiteboard_events
      WHERE live_class_id = $1::bigint
      ORDER BY
        created_at DESC NULLS LAST,
        id DESC
      LIMIT 1
      `,
      [id]
    );

    const row = result.rows[0] || null;
    const whiteboard = row?.payload ?? null;

    return res.json({
      success: true,

      whiteboard,
      payload: whiteboard,
      drawing: whiteboard,

      event: row,
      data: whiteboard,
    });
  } catch (error) {
    console.error("WHITEBOARD FETCH DATABASE ERROR", {
      message: error?.message,
      code: error?.code,
      detail: error?.detail,
      table: error?.table,
      column: error?.column,
      stack: error?.stack,
    });

    return sendError(
      res,
      error,
      "Failed to fetch whiteboard"
    );
  }
});

/* =========================================================
   RESOURCES - FIXED RESOURCE TYPE VALIDATION
========================================================= */

router.post("/live-classes/:id/resources", async (req, res) => {
  try {
    const id = getSessionId(req);

    if (!isValidBigIntId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid live class ID",
      });
    }

    const body = req.body || {};

    const suppliedType =
      body.resourceType ||
      body.resource_type ||
      body.type ||
      "file";

    const resourceType = normaliseResourceType(suppliedType);

    if (!resourceType) {
      return res.status(400).json({
        success: false,
        message: `Invalid resource type: ${clean(suppliedType)}`,
        allowedTypes: VALID_RESOURCE_TYPES,
      });
    }

    const title = clean(body.title) || "Resource";

    const fileUrl = clean(
      body.fileUrl ||
        body.file_url ||
        body.url ||
        body.link
    );

    if (!fileUrl) {
      return res.status(400).json({
        success: false,
        message: "Resource URL or file path is required",
      });
    }

    const currentPage = Math.max(
      1,
      Number(body.currentPage ?? body.current_page ?? 1) || 1
    );

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
      return res.status(404).json({
        success: false,
        message: "Live class not found",
      });
    }

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
      VALUES (
        $1::bigint,
        $2,
        $3,
        $4,
        $5,
        TRUE,
        NOW(),
        NOW()
      )
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
      message: "Resource added successfully",
      resource: result.rows[0],
      data: result.rows[0],
    });
  } catch (error) {
    return sendError(
      res,
      error,
      "Failed to add live class resource"
    );
  }
});

router.get("/live-classes/:id/resources", async (req, res) => {
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
});

/* =========================================================
   RECORDING
========================================================= */

router.post("/live-classes/:id/recording", async (req, res) => {
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
      body.recordingUrl || body.recording_url
    );

    const recordingStatus =
      clean(
        body.status ||
          body.recordingStatus ||
          body.recording_status
      ) || (recordingUrl ? "completed" : "processing");

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
      [recordingUrl, recordingStatus, duration, id]
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
});

router.get("/tutor/live-recordings", async (req, res) => {
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
});

/* =========================================================
   GET LIVE CLASS BY ROOM CODE
========================================================= */

const getLiveClassByRoom = async (req, res) => {
  try {
    const suppliedRoomValue = clean(
      req.params.roomCode || req.params.roomId
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
        OR ($2::boolean = TRUE AND c.id = $3::bigint)
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
      error:
        process.env.NODE_ENV === "production"
          ? undefined
          : error.message,
    });
  }
};

router.get("/live-class/room/:roomCode", getLiveClassByRoom);
router.get("/live-classes/room/:roomCode", getLiveClassByRoom);

/* =========================================================
   EXPORT
========================================================= */

export default router;
