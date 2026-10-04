// server/server.js

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

import pool from "./lib/db.js";

// ============================================================
// ROUTES
// ============================================================

import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import courseCategoryRoutes from "./routes/courseCategoryRoutes.js";
import documentRoutes from "./routes/documentRoutes.js";
import resourceRoutes from "./routes/resourceRoutes.js";
import tutorRoutes from "./routes/tutorRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import novelRoutes from "./routes/novelRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import learningMaterialsRouter from "./routes/learningMaterials.js";
import tutorAssignmentsRouter from "./routes/academyTutorAssignments.js";

// ============================================================
// SCHOLIQEN ACADEMY ROUTES
// ============================================================

import academyTaskManagementRoutes from "./routes/academyTaskManagementRoutes.js";
import academyTaskSubmissionRoutes from "./routes/academyTaskSubmissionRoutes.js";
import academyRoutes from "./routes/academyRoutes.js";
import academyTeachingRoutes from "./routes/academyTeaching.js";

import academyAssignmentRoutes from "./routes/academyAssignmentRoutes.js";

import academyLessonRoutes from "./routes/academyLessonRoutes.js";
import academyLiveClassRoutes from "./routes/academyLiveClassRoutes.js";
import academyTutorAttendanceRoutes from "./routes/academyTutorAttendance.js";
import academyTutorMessages from "./routes/academyTutorMessages.js";
import academyTutorAnnouncements from "./routes/academyTutorAnnouncements.js";
import academyEnrollmentRoutes from "./routes/academyEnrollmentRoutes.js";
import academyStudentMaterialsRoutes from "./routes/academyStudentMaterials.js";

// ============================================================
// PATH CONFIGURATION
// ============================================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, "..");

const ENV_PATH = path.join(
  ROOT_DIR,
  ".env"
);

// ============================================================
// LOAD ENVIRONMENT
// ============================================================

const envResult = dotenv.config({
  path: ENV_PATH,
  override: false,
});

if (envResult.error) {
  console.warn("");
  console.warn("⚠️ Could not load .env");
  console.warn("📁 Expected:", ENV_PATH);
  console.warn(
    "Reason:",
    envResult.error.message
  );
  console.warn("");
} else {
  console.log(
    `✅ Environment loaded from: ${ENV_PATH}`
  );
}

// ============================================================
// APP
// ============================================================

const app = express();

// ============================================================
// UPLOAD DIRECTORIES
// ============================================================

const UPLOADS_DIR = path.join(
  __dirname,
  "uploads"
);

const ACADEMY_ASSIGNMENTS_DIR = path.join(
  UPLOADS_DIR,
  "academy-assignments"
);

const NOVEL_COVERS_DIR = path.join(
  UPLOADS_DIR,
  "covers"
);

const DOCUMENTS_DIR = path.join(
  UPLOADS_DIR,
  "documents"
);

const THUMBNAILS_DIR = path.join(
  UPLOADS_DIR,
  "thumbnails"
);

const VIDEOS_DIR = path.join(
  UPLOADS_DIR,
  "videos"
);

// ============================================================
// CREATE UPLOAD DIRECTORIES
// ============================================================

for (const directory of [
  UPLOADS_DIR,
  ACADEMY_ASSIGNMENTS_DIR,
  NOVEL_COVERS_DIR,
  DOCUMENTS_DIR,
  THUMBNAILS_DIR,
  VIDEOS_DIR,
]) {
  try {
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, {
        recursive: true,
      });
    }
  } catch (error) {
    console.error(
      `❌ Unable to prepare upload directory: ${directory}`,
      error?.message
    );
  }
}

// ============================================================
// PORT
// ============================================================

const PORT =
  Number(process.env.PORT) || 5000;

// ============================================================
// ENVIRONMENT VARIABLES
// ============================================================

const FRONTEND_URL =
  process.env.FRONTEND_URL?.trim() ||
  "http://localhost:5173";

const DATABASE_URL =
  process.env.DATABASE_URL?.trim();

const JWT_SECRET =
  process.env.JWT_SECRET?.trim();

const PAYSTACK_SECRET_KEY =
  process.env.PAYSTACK_SECRET_KEY?.trim();

const GROQ_API_KEY =
  process.env.GROQ_API_KEY?.trim();

// ============================================================
// CONFIGURATION STATUS
// ============================================================

const databaseConfigured =
  Boolean(DATABASE_URL);

const jwtConfigured =
  Boolean(JWT_SECRET);

const paystackConfigured =
  Boolean(PAYSTACK_SECRET_KEY);

const groqConfigured =
  Boolean(GROQ_API_KEY);

// ============================================================
// PAYSTACK MODE
// ============================================================

const paystackMode =
  PAYSTACK_SECRET_KEY?.startsWith("sk_live_")
    ? "live"
    : PAYSTACK_SECRET_KEY?.startsWith("sk_test_")
      ? "test"
      : "not-configured";

// ============================================================
// PAYMENT CONFIGURATION
// ============================================================

const PREMIUM_PRICE_NAIRA = 100;

const PREMIUM_PRICE_KOBO =
  PREMIUM_PRICE_NAIRA * 100;

// ============================================================
// PREMIUM PRODUCTS
// ============================================================

const PREMIUM_PRODUCTS = {
  cbt: {
    name: "CBT Practice",
    priceNaira: PREMIUM_PRICE_NAIRA,
    priceKobo: PREMIUM_PRICE_KOBO,
  },

  novel: {
    name: "Premium Novels",
    priceNaira: PREMIUM_PRICE_NAIRA,
    priceKobo: PREMIUM_PRICE_KOBO,
  },

  multilingual: {
    name: "Multilingual Access",
    priceNaira: PREMIUM_PRICE_NAIRA,
    priceKobo: PREMIUM_PRICE_KOBO,
  },

  lms: {
    name: "LMS Premium Access",
    priceNaira: PREMIUM_PRICE_NAIRA,
    priceKobo: PREMIUM_PRICE_KOBO,
  },

  virtual_lab: {
    name: "Virtual Laboratory",
    priceNaira: PREMIUM_PRICE_NAIRA,
    priceKobo: PREMIUM_PRICE_KOBO,
  },
};

// ============================================================
// ENVIRONMENT CHECK
// ============================================================

console.log("");

console.log(
  "=================================================="
);

console.log(
  "🔧 SCHOLIQEN ENVIRONMENT CHECK"
);

console.log(
  "=================================================="
);

console.log(
  `📁 Root .env:       ${ENV_PATH}`
);

console.log(
  `🗄️ PostgreSQL:      ${
    databaseConfigured
      ? "FOUND ✅"
      : "MISSING ❌"
  }`
);

console.log(
  `🎫 JWT Secret:      ${
    jwtConfigured
      ? "FOUND ✅"
      : "MISSING ❌"
  }`
);

console.log(
  `💳 Paystack:        ${
    paystackConfigured
      ? "FOUND ✅"
      : "MISSING ❌"
  }`
);

console.log(
  `🤖 Groq:            ${
    groqConfigured
      ? "FOUND ✅"
      : "MISSING ❌"
  }`
);

console.log(
  `💰 Test Price:      ₦${PREMIUM_PRICE_NAIRA}`
);

console.log(
  `🪙 Paystack Amount: ${PREMIUM_PRICE_KOBO} kobo`
);

console.log(
  `📦 Products:        ${
    Object.keys(PREMIUM_PRODUCTS).length
  }`
);

console.log(
  `🔐 Paystack Mode:   ${paystackMode}`
);

console.log(
  "=================================================="
);

console.log("");

// ============================================================
// CORS
// ============================================================

const allowedOrigins = [
  FRONTEND_URL,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }

      if (
        allowedOrigins.includes(origin)
      ) {
        return callback(null, true);
      }

      // Preserve existing permissive behavior.
      return callback(null, true);
    },

    credentials: true,

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Origin",
      "Content-Type",
      "Authorization",
      "Accept",
      "X-Requested-With",
      "x-paystack-signature",
      "x-tutor-reference",
      "x-academy-token",
      "x-student-token",
      "x-material-access-token",
    ],

    optionsSuccessStatus: 204,
  })
);

// ============================================================
// PAYSTACK WEBHOOK RAW BODY
// ============================================================

app.use(
  "/api/payments/webhook",
  express.raw({
    type: "application/json",
    limit: "2mb",
  })
);

// ============================================================
// JSON BODY PARSER
// ============================================================

app.use(
  express.json({
    limit: "2mb",
  })
);

// ============================================================
// URL ENCODED BODY
// ============================================================

app.use(
  express.urlencoded({
    extended: true,
    limit: "2mb",
  })
);

// ============================================================
// REQUEST LOGGER
// ============================================================

app.use(
  (req, res, next) => {
    console.log(
      `➡️ ${req.method} ${req.originalUrl}`
    );

    if (
      ["POST", "PUT", "PATCH"].includes(
        req.method
      )
    ) {
      console.log(
        "📦 Request body:",
        req.body
      );
    }

    next();
  }
);

// ============================================================
// STATIC UPLOADS
// ============================================================

app.use(
  "/uploads",
  express.static(
    UPLOADS_DIR,
    {
      fallthrough: true,

      setHeaders: (
        res,
        filePath
      ) => {
        // ======================================================
        // CORS
        // ======================================================

        res.setHeader(
          "Access-Control-Allow-Origin",
          FRONTEND_URL
        );

        res.setHeader(
          "Access-Control-Allow-Credentials",
          "true"
        );

        res.setHeader(
          "Access-Control-Allow-Methods",
          "GET, OPTIONS"
        );

        res.setHeader(
          "Access-Control-Allow-Headers",
          [
            "Origin",
            "Content-Type",
            "Authorization",
            "Accept",
            "X-Requested-With",
            "x-academy-token",
            "x-student-token",
            "x-material-access-token",
            "x-tutor-reference",
          ].join(", ")
        );

        res.setHeader(
          "Cache-Control",
          "public, max-age=3600"
        );

        const lowerPath =
          String(
            filePath || ""
          ).toLowerCase();

        // ======================================================
        // PDF
        // ======================================================

        if (
          lowerPath.endsWith(".pdf")
        ) {
          res.setHeader(
            "Content-Type",
            "application/pdf"
          );

          res.setHeader(
            "Content-Disposition",
            "inline"
          );

          res.setHeader(
            "X-Content-Type-Options",
            "nosniff"
          );

          return;
        }

        // ======================================================
        // MP4
        // ======================================================

        if (
          lowerPath.endsWith(".mp4")
        ) {
          res.setHeader(
            "Content-Type",
            "video/mp4"
          );

          res.setHeader(
            "Content-Disposition",
            "inline"
          );

          return;
        }

        // ======================================================
        // WEBM
        // ======================================================

        if (
          lowerPath.endsWith(".webm")
        ) {
          res.setHeader(
            "Content-Type",
            "video/webm"
          );

          res.setHeader(
            "Content-Disposition",
            "inline"
          );

          return;
        }

        // ======================================================
        // MOV
        // ======================================================

        if (
          lowerPath.endsWith(".mov")
        ) {
          res.setHeader(
            "Content-Type",
            "video/quicktime"
          );

          res.setHeader(
            "Content-Disposition",
            "inline"
          );

          return;
        }

        // ======================================================
        // DOC
        // ======================================================

        if (
          lowerPath.endsWith(".doc")
        ) {
          res.setHeader(
            "Content-Type",
            "application/msword"
          );

          return;
        }

        // ======================================================
        // DOCX
        // ======================================================

        if (
          lowerPath.endsWith(".docx")
        ) {
          res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          );

          return;
        }
      },
    }
  )
);

// ============================================================
// LEGACY / EXISTING TUTOR ASSIGNMENT ROUTER
// ============================================================

app.use(
  "/api/academy/tutor/assignments",
  tutorAssignmentsRouter
);

// ============================================================
// ADMIN MATERIAL ROUTES
// ============================================================

app.use(
  "/api/admin/lms/materials",
  learningMaterialsRouter
);

// ============================================================
// STUDENT MATERIAL ROUTES
// ============================================================

app.use(
  "/api/academy/student/materials",
  academyStudentMaterialsRoutes
);

// ============================================================
// ACADEMY ENROLLMENT ROUTES
// ============================================================

app.use(
  "/api/academy",
  academyEnrollmentRoutes
);

// ============================================================
// ROOT ROUTE
// ============================================================

app.get(
  "/",
  (req, res) => {
    return res.status(200).json({
      success: true,

      message:
        "Scholiqen Backend is running.",

      server:
        "online",

      environment:
        process.env.NODE_ENV ||
        "development",

      endpoints: {
        auth:
          "/api/auth",

        signup:
          "POST /api/auth/signup",

        login:
          "POST /api/auth/login",

        currentUser:
          "GET /api/auth/me",

        admin:
          "/api/admin",

        adminDashboard:
          "GET /api/admin/dashboard",

        adminMaterials:
          "/api/admin/lms/materials",

        studentMaterials:
          "/api/academy/student/materials",

        studentAssignments:
          "GET /api/academy/student/assignments",

        studentAssignment:
          "GET /api/academy/student/assignments/:id",

        studentAssignmentFile:
          "GET /api/academy/student/assignments/:id/file",

        submitStudentAssignment:
          "POST /api/academy/student/assignments/:id/submit",

        studentAssignmentResult:
          "GET /api/academy/student/assignments/:id/result",

        tutorAssignments:
          "/api/academy/tutor/assignments",

        courses:
          "/api/courses",

        courseStats:
          "GET /api/courses/stats",

        courseCategories:
          "/api/course-categories",

        documents:
          "/api/documents",

        resources:
          "/api/resources",

        tasks:
          "/api/tasks",

        novels:
          "/api/novels",

        tutor:
          "/api/tutor",

        payments:
          "/api/payments",

        academy:
          "/api/academy",

        health:
          "GET /api/health",
      },

      frontend:
        FRONTEND_URL,

      database: {
        provider:
          "PostgreSQL / Neon",

        configured:
          databaseConfigured,
      },

      authentication: {
        provider:
          "JWT",

        configured:
          databaseConfigured &&
          jwtConfigured,
      },

      payment: {
        testPriceNaira:
          PREMIUM_PRICE_NAIRA,

        testPriceKobo:
          PREMIUM_PRICE_KOBO,

        currency:
          "NGN",

        mode:
          paystackMode,

        products:
          Object.keys(
            PREMIUM_PRODUCTS
          ),
      },

      services: {
        authentication:
          databaseConfigured &&
          jwtConfigured,

        database:
          databaseConfigured,

        novels:
          true,

        resources:
          true,

        tasks:
          true,

        admin:
          databaseConfigured &&
          jwtConfigured,

        paystack:
          paystackConfigured,

        groq:
          groqConfigured,

        academy:
          databaseConfigured,

        academyTeaching:
          databaseConfigured,

        academyTaskManagement:
          databaseConfigured,

        academyTaskSubmissions:
          databaseConfigured,

        academyTutorAttendance:
          databaseConfigured,

        academyTutorMessages:
          databaseConfigured,

        academyTutorAnnouncements:
          databaseConfigured,

        studentMaterials:
          databaseConfigured,

        studentAssignments:
          databaseConfigured,

        adminMaterials:
          databaseConfigured &&
          jwtConfigured,
      },
    });
  }
);

// ============================================================
// HEALTH CHECK
// ============================================================

app.get(
  "/api/health",
  async (req, res) => {
    let databaseStatus =
      databaseConfigured;

    let databaseMessage =
      databaseConfigured
        ? "configured"
        : "missing";

    if (databaseConfigured) {
      try {
        await pool.query(
          "SELECT 1"
        );

        databaseStatus = true;

        databaseMessage =
          "connected";
      } catch (error) {
        databaseStatus = false;

        databaseMessage =
          "connection failed";

        console.error(
          "❌ PostgreSQL health check failed:",
          error?.message
        );
      }
    }

    return res.status(200).json({
      success: true,

      server:
        "online",

      service:
        "Scholiqen Backend",

      environment:
        process.env.NODE_ENV ||
        "development",

      port:
        PORT,

      frontend:
        FRONTEND_URL,

      authentication:
        databaseConfigured &&
        jwtConfigured,

      database: {
        provider:
          "PostgreSQL / Neon",

        configured:
          databaseConfigured,

        connected:
          databaseStatus,

        status:
          databaseMessage,
      },

      databaseConfigured,

      jwtConfigured,

      groqConfigured,

      paystackConfigured,

      paystackMode,

      payment: {
        currency:
          "NGN",

        testPriceNaira:
          PREMIUM_PRICE_NAIRA,

        testPriceKobo:
          PREMIUM_PRICE_KOBO,

        products:
          Object.keys(
            PREMIUM_PRODUCTS
          ),
      },

      timestamp:
        new Date().toISOString(),
    });
  }
);

// ============================================================
// CBT QUESTIONS
// ============================================================

app.get(
  "/api/cbt/questions",
  async (req, res) => {
    try {
      const exam =
        String(
          req.query.exam || ""
        ).trim();

      const subjectsParam =
        String(
          req.query.subjects || ""
        ).trim();

      if (!exam) {
        return res.status(400).json({
          success: false,
          questions: [],
          count: 0,
          total: 0,
          error:
            "Exam is required.",
        });
      }

      const subjects =
        subjectsParam
          ? subjectsParam
              .split(",")
              .map(
                (subject) =>
                  subject.trim()
              )
              .filter(Boolean)
          : [];

      let query = `
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
        WHERE LOWER(TRIM(exam)) =
              LOWER(TRIM($1))
      `;

      const values = [exam];

      if (
        subjects.length > 0
      ) {
        const placeholders =
          subjects.map(
            (_, index) =>
              `$${index + 2}`
          );

        query += `
          AND LOWER(TRIM(subject))
          IN (
            ${placeholders
              .map(
                (placeholder) =>
                  `LOWER(TRIM(${placeholder}))`
              )
              .join(", ")}
          )
        `;

        values.push(
          ...subjects
        );
      }

      query += `
        ORDER BY
          subject ASC,
          created_at DESC
      `;

      const result =
        await pool.query(
          query,
          values
        );

      const subjectCounts =
        {};

      result.rows.forEach(
        (row) => {
          const subject =
            row.subject ||
            "Unknown";

          subjectCounts[
            subject
          ] =
            (
              subjectCounts[
                subject
              ] || 0
            ) + 1;
        }
      );

      return res.status(200).json({
        success: true,

        questions:
          result.rows,

        count:
          result.rows.length,

        total:
          result.rows.length,

        subjectCounts,
      });
    } catch (error) {
      console.error(
        "❌ CBT QUESTIONS API ERROR:",
        error
      );

      return res.status(500).json({
        success: false,

        questions: [],

        count: 0,

        total: 0,

        error:
          "Unable to fetch CBT questions.",

        details:
          process.env.NODE_ENV ===
          "development"
            ? error?.message
            : undefined,
      });
    }
  }
);

// ============================================================
// CBT QUESTION COUNT
// ============================================================

app.get(
  "/api/cbt/questions/count",
  async (req, res) => {
    try {
      const result =
        await pool.query(`
          SELECT
            COUNT(*)::integer AS count
          FROM cbt_questions
        `);

      const count =
        Number(
          result.rows[0]?.count ||
          0
        );

      return res.status(200).json({
        success: true,

        count,

        total:
          count,

        questionCount:
          count,
      });
    } catch (error) {
      console.error(
        "❌ CBT QUESTION COUNT ERROR:",
        error
      );

      return res.status(500).json({
        success: false,

        count: 0,

        total: 0,

        questionCount: 0,

        error:
          "Unable to fetch CBT question count.",

        details:
          process.env.NODE_ENV ===
          "development"
            ? error?.message
            : undefined,
      });
    }
  }
);

// ============================================================
// AUTH ROUTES
// ============================================================

app.use(
  "/api/auth",
  authRoutes
);

// ============================================================
// ADMIN ROUTES
// ============================================================

app.use(
  "/api/admin",
  adminRoutes
);

// ============================================================
// COURSE ROUTES
// ============================================================

app.use(
  "/api/courses",
  courseRoutes
);

// ============================================================
// COURSE CATEGORY ROUTES
// ============================================================

app.use(
  "/api/course-categories",
  courseCategoryRoutes
);

// ============================================================
// DOCUMENT ROUTES
// ============================================================

app.use(
  "/api/documents",
  documentRoutes
);

// ============================================================
// RESOURCE ROUTES
// ============================================================

app.use(
  "/api/resources",
  resourceRoutes
);

// ============================================================
// TASK ROUTES
// ============================================================

app.use(
  "/api/tasks",
  taskRoutes
);

// ============================================================
// NOVEL ROUTES
// ============================================================

app.use(
  "/api/novels",
  novelRoutes
);

// ============================================================
// AI TUTOR ROUTES
// ============================================================

app.use(
  "/api/tutor",
  tutorRoutes
);

// ============================================================
// PAYMENT ROUTES
// ============================================================

app.use(
  "/api/payments",
  paymentRoutes
);

// ============================================================
// ACADEMY TASK MANAGEMENT
// ============================================================

app.use(
  "/api/academy",
  academyTaskManagementRoutes
);

// ============================================================
// ACADEMY TASK SUBMISSIONS
// ============================================================

app.use(
  "/api/academy",
  academyTaskSubmissionRoutes
);

// ============================================================
// ACADEMY MAIN ROUTES
// ============================================================

app.use(
  "/api/academy",
  academyRoutes
);

// ============================================================
// ACADEMY ASSIGNMENTS
// ============================================================
//
// IMPORTANT:
//
// This now uses:
//
// academyAssignments.js
//
// and therefore exposes:
//
// GET
// /api/academy/student/assignments
//
// GET
// /api/academy/student/assignments/:id
//
// GET
// /api/academy/student/assignments/:id/file
//
// POST
// /api/academy/student/assignments/:id/submit
//
// GET
// /api/academy/student/assignments/:id/result
//
// ============================================================

app.use(
  "/api/academy",
  academyAssignmentRoutes
);

// ============================================================
// ACADEMY LESSONS
// ============================================================

app.use(
  "/api/academy",
  academyLessonRoutes
);

// ============================================================
// ACADEMY TEACHING
// ============================================================

app.use(
  "/api/academy",
  academyTeachingRoutes
);

// ============================================================
// ACADEMY LIVE CLASSES
// ============================================================

app.use(
  "/api/academy",
  academyLiveClassRoutes
);

// ============================================================
// ACADEMY TUTOR ATTENDANCE
// ============================================================

app.use(
  "/api/academy/tutor",
  academyTutorAttendanceRoutes
);

// ============================================================
// ACADEMY TUTOR MESSAGES
// ============================================================

app.use(
  "/api/academy/tutor",
  academyTutorMessages
);

// ============================================================
// ACADEMY TUTOR ANNOUNCEMENTS
// ============================================================

app.use(
  "/api/academy/tutor",
  academyTutorAnnouncements
);

// ============================================================
// 404 HANDLER
// ============================================================

app.use(
  (req, res) => {
    console.warn(
      `⚠️ Route not found: ${req.method} ${req.originalUrl}`
    );

    return res.status(404).json({
      success: false,

      error:
        "Route not found.",

      path:
        req.originalUrl,

      method:
        req.method,
    });
  }
);

// ============================================================
// GLOBAL ERROR HANDLER
// ============================================================

app.use(
  (error, req, res, next) => {
    console.error("");

    console.error(
      "=================================================="
    );

    console.error(
      "❌ SCHOLIQEN SERVER ERROR"
    );

    console.error(
      "=================================================="
    );

    console.error(
      "Method:",
      req.method
    );

    console.error(
      "URL:",
      req.originalUrl
    );

    console.error(
      "Message:",
      error?.message
    );

    console.error(
      "Stack:",
      error?.stack
    );

    console.error(
      "=================================================="
    );

    console.error("");

    if (res.headersSent) {
      return next(error);
    }

    return res.status(
      error?.status || 500
    ).json({
      success: false,

      error:
        error?.message ||
        "Internal server error.",
    });
  }
);

// ============================================================
// START SERVER
// ============================================================

const server = app.listen(
  PORT,
  () => {
    console.log("");

    console.log(
      "=================================================="
    );

    console.log(
      "🚀 SCHOLIQEN BACKEND SERVER"
    );

    console.log(
      "=================================================="
    );

    console.log(
      `🌐 Server: http://localhost:${PORT}`
    );

    console.log(
      `🌐 Frontend: ${FRONTEND_URL}`
    );

    console.log(
      `📂 Uploads: ${UPLOADS_DIR}`
    );

    console.log(
      `📄 Assignment uploads: ${ACADEMY_ASSIGNMENTS_DIR}`
    );

    console.log(
      `🗄️ Database: ${
        databaseConfigured
          ? "Configured ✅"
          : "Not configured ❌"
      }`
    );

    console.log(
      `🎫 JWT: ${
        jwtConfigured
          ? "Configured ✅"
          : "Missing ❌"
      }`
    );

    console.log(
      `🤖 Groq: ${
        groqConfigured
          ? "Configured ✅"
          : "Missing ❌"
      }`
    );

    console.log(
      `💳 Paystack: ${
        paystackConfigured
          ? "Configured"
          : "Not configured"
      }`
    );

    console.log("");

    console.log(
      "📝 STUDENT ASSIGNMENT ROUTES:"
    );

    console.log(
      "   GET    /api/academy/student/assignments"
    );

    console.log(
      "   GET    /api/academy/student/assignments/:id"
    );

    console.log(
      "   GET    /api/academy/student/assignments/:id/file"
    );

    console.log(
      "   POST   /api/academy/student/assignments/:id/submit"
    );

    console.log(
      "   GET    /api/academy/student/assignments/:id/result"
    );

    console.log("");

    console.log(
      "👨‍🏫 TUTOR ASSIGNMENT ROUTES:"
    );

    console.log(
      "   POST   /api/academy/tutor/assignments"
    );

    console.log(
      "   GET    /api/academy/tutor/assignments"
    );

    console.log(
      "   GET    /api/academy/tutor/assignments/:id"
    );

    console.log("");

    console.log(
      "📚 ACADEMY TASK ROUTES:"
    );

    console.log(
      "   GET    /api/academy/tutor/tasks"
    );

    console.log(
      "   GET    /api/academy/tutor/tasks/:taskId"
    );

    console.log(
      "   PATCH  /api/academy/tutor/tasks/:taskId"
    );

    console.log(
      "   DELETE /api/academy/tutor/tasks/:taskId"
    );

    console.log(
      "   POST   /api/academy/tutor/tasks"
    );

    console.log(
      "   GET    /api/academy/tutor/tasks/submissions"
    );

    console.log(
      "   POST   /api/academy/student/tasks/:taskId/submission"
    );

    console.log("");

    console.log(
      "📚 MATERIAL ROUTES:"
    );

    console.log(
      "   GET    /api/admin/lms/materials"
    );

    console.log(
      "   GET    /api/academy/student/materials"
    );

    console.log("");

    console.log(
      "❤️ HEALTH:"
    );

    console.log(
      "   GET    /api/health"
    );

    console.log("");

    console.log(
      "=================================================="
    );

    console.log(
      "✅ SCHOLIQEN SERVER READY"
    );

    console.log(
      "=================================================="
    );

    console.log("");
  }
);

// ============================================================
// SERVER ERROR
// ============================================================

server.on(
  "error",
  (error) => {
    console.error("");

    console.error(
      "❌ SERVER STARTUP ERROR"
    );

    console.error(
      error
    );

    console.error("");

    if (
      error?.code ===
      "EADDRINUSE"
    ) {
      console.error(
        `❌ Port ${PORT} is already in use.`
      );
    }
  }
);

// ============================================================
// GRACEFUL SHUTDOWN
// ============================================================

const shutdown = async (
  signal
) => {
  console.log("");

  console.log(
    `🛑 ${signal} received. Shutting down...`
  );

  server.close(
    async () => {
      try {
        await pool.end();

        console.log(
          "🗄️ Database connection pool closed."
        );
      } catch (error) {
        console.error(
          "❌ Error closing database pool:",
          error?.message
        );
      }

      console.log(
        "✅ Server shutdown complete."
      );

      process.exit(0);
    }
  );
};

process.on(
  "SIGINT",
  () => shutdown("SIGINT")
);

process.on(
  "SIGTERM",
  () => shutdown("SIGTERM")
);
