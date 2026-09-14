// server/server.js

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
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

// ============================================================
// SCHOLIQEN ACADEMY ROUTES
// ============================================================

import academyTaskManagementRoutes from "./routes/academyTaskManagementRoutes.js";
import academyTaskSubmissionRoutes from "./routes/academyTaskSubmissionRoutes.js";
import academyRoutes from "./routes/academyRoutes.js";
import academyTeachingRoutes from "./routes/academyTeaching.js";
import academyAssignmentRoutes from "./routes/academyAssignmentRoutes.js";
import academyLessonRoutes from "./routes/academyLessonRoutes.js";
import materialRoutes from "./routes/materialRoutes.js";
import academyLiveClassRoutes from "./routes/academyLiveClassRoutes.js";
import academyTutorAttendanceRoutes from "./routes/academyTutorAttendance.js";
import academyTutorMessages from "./routes/academyTutorMessages.js";
import academyTutorAnnouncements from "./routes/academyTutorAnnouncements.js";

// ============================================================
// PATH CONFIGURATION
// ============================================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, "..");
const ENV_PATH = path.join(ROOT_DIR, ".env");

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

void NOVEL_COVERS_DIR;
void DOCUMENTS_DIR;
void THUMBNAILS_DIR;
void VIDEOS_DIR;

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
    priceNaira:
      PREMIUM_PRICE_NAIRA,
    priceKobo:
      PREMIUM_PRICE_KOBO,
  },

  novel: {
    name: "Premium Novels",
    priceNaira:
      PREMIUM_PRICE_NAIRA,
    priceKobo:
      PREMIUM_PRICE_KOBO,
  },

  multilingual: {
    name: "Multilingual Access",
    priceNaira:
      PREMIUM_PRICE_NAIRA,
    priceKobo:
      PREMIUM_PRICE_KOBO,
  },

  lms: {
    name: "LMS Premium Access",
    priceNaira:
      PREMIUM_PRICE_NAIRA,
    priceKobo:
      PREMIUM_PRICE_KOBO,
  },

  virtual_lab: {
    name: "Virtual Laboratory",
    priceNaira:
      PREMIUM_PRICE_NAIRA,
    priceKobo:
      PREMIUM_PRICE_KOBO,
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
    Object.keys(
      PREMIUM_PRODUCTS
    ).length
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
    origin: (
      origin,
      callback
    ) => {
      if (!origin) {
        return callback(
          null,
          true
        );
      }

      if (
        allowedOrigins.includes(
          origin
        )
      ) {
        return callback(
          null,
          true
        );
      }

      // Keep existing permissive CORS behavior.
      return callback(
        null,
        true
      );
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
    ],
  })
);

// ============================================================
// STATIC UPLOADS
// ============================================================

app.use(
  "/uploads",
  express.static(
    UPLOADS_DIR,
    {
      setHeaders: (
        res,
        filePath
      ) => {
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
          "Origin, Content-Type, Authorization, Accept, X-Requested-With"
        );

        if (
          filePath
            .toLowerCase()
            .endsWith(".pdf")
        ) {
          res.setHeader(
            "Content-Type",
            "application/pdf"
          );
        }
      },
    }
  )
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
// JSON BODY
// IMPORTANT: This comes BEFORE POST announcement routes.
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

    next();
  }
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

        resourceTopics:
          "GET /api/resources/topics",

        resourceList:
          "GET /api/resources",

        singleResource:
          "GET /api/resources/:id",

        tasks:
          "/api/tasks",

        taskTest:
          "GET /api/tasks/test",

        taskList:
          "GET /api/tasks",

        taskByTopic:
          "GET /api/tasks/topic/:topicId",

        singleTask:
          "GET /api/tasks/:id",

        createTask:
          "POST /api/tasks",

        updateTask:
          "PUT /api/tasks/:id",

        deleteTask:
          "DELETE /api/tasks/:id",

        novels:
          "/api/novels",

        singleNovel:
          "GET /api/novels/:id",

        cbtQuestions:
          "GET /api/cbt/questions",

        cbtQuestionCount:
          "GET /api/cbt/questions/count",

        tutor:
          "/api/tutor",

        payments:
          "/api/payments",

        academy:
          "/api/academy",

        studentEnrollment:
          "POST /api/academy/student-enrollment",

        tutorApplication:
          "POST /api/academy/tutor-application",

        studentEnrollmentByUser:
          "GET /api/academy/student/:userId",

        tutorApplicationByReference:
          "GET /api/academy/tutor-application/:reference",

        tutorTasks:
          "GET /api/academy/tutor/tasks",

        tutorTaskDetails:
          "GET /api/academy/tutor/tasks/:taskId",

        updateTutorTask:
          "PATCH /api/academy/tutor/tasks/:taskId",

        deleteTutorTask:
          "DELETE /api/academy/tutor/tasks/:taskId",

        createTutorTask:
          "POST /api/academy/tutor/tasks",

        tutorTaskSubmissions:
          "GET /api/academy/tutor/tasks/submissions",

        submitStudentTask:
          "POST /api/academy/student/tasks/:taskId/submission",

        tutorClasses:
          "GET /api/academy/tutor/classes",

        tutorLiveClasses:
          "GET /api/academy/tutor/live-classes",

        createLiveClass:
          "POST /api/academy/tutor/live-classes",

        startLiveClass:
          "PATCH /api/academy/tutor/live-classes/:id/start",

        endLiveClass:
          "PATCH /api/academy/tutor/live-classes/:id/end",

        liveClassDetails:
          "GET /api/academy/tutor/live-classes/:id",

        joinLiveClass:
          "POST /api/academy/tutor/live-classes/:id/join",

        leaveLiveClass:
          "POST /api/academy/tutor/live-classes/:id/leave",

        liveParticipants:
          "GET /api/academy/tutor/live-classes/:id/participants",

        tutorLessons:
          "GET /api/academy/tutor/lessons",

        createTutorLesson:
          "POST /api/academy/tutor/lessons",

        tutorAttendanceClasses:
          "GET /api/academy/tutor/attendance/classes",

        tutorAttendance:
          "GET /api/academy/tutor/attendance",

        liveAttendance:
          "GET /api/academy/tutor/live-classes/:id/attendance",

        liveChat:
          "GET /api/academy/tutor/live-classes/:id/chat",

        sendLiveChat:
          "POST /api/academy/tutor/live-classes/:id/chat",

        tutorMaterials:
          "GET /api/academy/tutor/materials",

        uploadTutorMaterial:
          "POST /api/academy/tutor/materials",

        saveRecording:
          "POST /api/academy/tutor/live-classes/:id/recording",

        whiteboard:
          "GET /api/academy/tutor/live-classes/:id/whiteboard",

        saveWhiteboard:
          "POST /api/academy/tutor/live-classes/:id/whiteboard",

        // ======================================================
        // TUTOR STUDENT MESSAGES
        // ======================================================

        tutorStudentMessages:
          "GET /api/academy/tutor/messages",

        tutorConversationMessages:
          "GET /api/academy/tutor/messages/:conversationId",

        sendTutorStudentMessage:
          "POST /api/academy/tutor/messages/:conversationId",

        startTutorStudentConversation:
          "POST /api/academy/tutor/messages/start",

        // ======================================================
        // TUTOR ANNOUNCEMENTS
        // ======================================================

        tutorAnnouncements:
          "GET /api/academy/tutor/announcements",

        tutorAnnouncement:
          "GET /api/academy/tutor/announcements/:id",

        createTutorAnnouncement:
          "POST /api/academy/tutor/announcements",

        updateTutorAnnouncement:
          "PATCH /api/academy/tutor/announcements/:id",

        deleteTutorAnnouncement:
          "DELETE /api/academy/tutor/announcements/:id",

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

      console.log("");

      console.log(
        "=================================================="
      );

      console.log(
        "📝 CBT QUESTIONS REQUEST"
      );

      console.log(
        "=================================================="
      );

      console.log(
        "📚 Exam:",
        exam || "NONE"
      );

      console.log(
        "📖 Subjects:",
        subjectsParam || "ALL"
      );

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

      console.log(
        "🔎 Running CBT query..."
      );

      console.log(
        "📌 SQL parameters:",
        values
      );

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

      console.log(
        `✅ CBT QUESTIONS FOUND: ${result.rows.length}`
      );

      console.log(
        "📊 SUBJECT BREAKDOWN:"
      );

      Object.entries(
        subjectCounts
      ).forEach(
        ([subject, count]) => {
          console.log(
            `   • ${subject}: ${count}`
          );
        }
      );

      console.log(
        "=================================================="
      );

      console.log("");

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
      console.error("");

      console.error(
        "=================================================="
      );

      console.error(
        "❌ CBT QUESTIONS API ERROR"
      );

      console.error(
        "=================================================="
      );

      console.error(
        "Message:",
        error?.message
      );

      console.error(
        "Code:",
        error?.code
      );

      console.error(
        "Detail:",
        error?.detail
      );

      console.error(
        "Hint:",
        error?.hint
      );

      console.error(
        "Position:",
        error?.position
      );

      console.error(
        "Stack:",
        error?.stack
      );

      console.error(
        "=================================================="
      );

      console.error("");

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
      console.log(
        "🔎 Counting CBT questions from Neon..."
      );

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

      console.log(
        `📝 CBT Question Count: ${count}`
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
      console.error("");

      console.error(
        "=================================================="
      );

      console.error(
        "❌ CBT QUESTION COUNT ERROR"
      );

      console.error(
        "=================================================="
      );

      console.error(
        "Message:",
        error?.message
      );

      console.error(
        "Code:",
        error?.code
      );

      console.error(
        "Detail:",
        error?.detail
      );

      console.error(
        "Hint:",
        error?.hint
      );

      console.error(
        "=================================================="
      );

      console.error("");

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

app.use(
  "/api/admin/lms/materials",
  materialRoutes
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
// VIDEO RESOURCE ROUTES
// ============================================================

app.use(
  "/api/resources",
  resourceRoutes
);

// ============================================================
// WEEKLY / MONTHLY TASK ROUTES
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
// ACADEMY TASK MANAGEMENT ROUTES
// ============================================================

app.use(
  "/api/academy",
  academyTaskManagementRoutes
);

// ============================================================
// ACADEMY TASK SUBMISSION ROUTES
// ============================================================

app.use(
  "/api/academy",
  academyTaskSubmissionRoutes
);

// ============================================================
// SCHOLIQEN ACADEMY MAIN ROUTES
// ============================================================

app.use(
  "/api/academy",
  academyRoutes
);

app.use(
  "/api/academy",
  academyAssignmentRoutes
);

app.use(
  "/api/academy",
  academyLessonRoutes
);

// ============================================================
// SCHOLIQEN ACADEMY TEACHING ROUTES
// ============================================================

app.use(
  "/api/academy",
  academyTeachingRoutes
);

// ============================================================
// SCHOLIQEN ACADEMY LIVE CLASS ROUTES
// ============================================================

app.use(
  "/api/academy",
  academyLiveClassRoutes
);

// ============================================================
// SCHOLIQEN ACADEMY TUTOR ATTENDANCE ROUTES
// ============================================================

app.use(
  "/api/academy/tutor",
  academyTutorAttendanceRoutes
);

// ============================================================
// SCHOLIQEN ACADEMY TUTOR STUDENT MESSAGES
// ============================================================

app.use(
  "/api/academy/tutor",
  academyTutorMessages
);

// ============================================================
// SCHOLIQEN ACADEMY TUTOR ANNOUNCEMENTS
// IMPORTANT:
// This is AFTER express.json() and BEFORE 404.
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
      error: "Route not found.",
      path: req.originalUrl,
      method: req.method,
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
      `🗄️ Database: ${
        databaseConfigured
          ? "Connected / Configured ✅"
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
      "📚 Academy routes:"
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

    console.log(
      "   GET    /api/academy/tutor/attendance/classes"
    );

    console.log(
      "   GET    /api/academy/tutor/attendance"
    );

    console.log("");

    console.log(
      "💬 Tutor student messaging routes:"
    );

    console.log(
      "   GET    /api/academy/tutor/messages"
    );

    console.log(
      "   GET    /api/academy/tutor/messages/:conversationId"
    );

    console.log(
      "   POST   /api/academy/tutor/messages/:conversationId"
    );

    console.log(
      "   POST   /api/academy/tutor/messages/start"
    );

    console.log("");

    console.log(
      "📢 Tutor announcement routes:"
    );

    console.log(
      "   GET    /api/academy/tutor/announcements"
    );

    console.log(
      "   GET    /api/academy/tutor/announcements/:id"
    );

    console.log(
      "   POST   /api/academy/tutor/announcements"
    );

    console.log(
      "   PATCH  /api/academy/tutor/announcements/:id"
    );

    console.log(
      "   DELETE /api/academy/tutor/announcements/:id"
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