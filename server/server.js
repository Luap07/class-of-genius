import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// ============================================================
// LOAD ROOT .ENV
// ============================================================
//
// Project structure:
//
// cog/
// ├── .env                 <-- YOUR ENV FILE
// ├── client/
// └── server/
//     ├── server.js        <-- this file
//     ├── routes/
//     └── lib/
//
// Since server.js is inside /server, we explicitly load
// ../.env from the project root.
//

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_ENV_PATH = path.resolve(
  __dirname,
  "../.env"
);

const envResult = dotenv.config({
  path: ROOT_ENV_PATH,
});

if (envResult.error) {
  console.warn(
    "⚠️ Could not load root .env file:"
  );

  console.warn(
    ROOT_ENV_PATH
  );

  console.warn(
    envResult.error.message
  );
} else {
  console.log(
    `✅ Environment loaded from: ${ROOT_ENV_PATH}`
  );
}

// ============================================================
// ROUTES
// ============================================================

import tutorRoutes from "./routes/tutorRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";

// ============================================================
// APP
// ============================================================

const app = express();

// ============================================================
// PORT
// ============================================================

const PORT =
  Number(process.env.PORT) || 5000;

// ============================================================
// CONFIG
// ============================================================

const FRONTEND_URL =
  process.env.FRONTEND_URL ||
  "http://localhost:5173";

// ============================================================
// ENVIRONMENT STATUS
// ============================================================

const supabaseUrl =
  process.env.SUPABASE_URL?.trim();

const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

const paystackSecretKey =
  process.env.PAYSTACK_SECRET_KEY?.trim();

const groqApiKey =
  process.env.GROQ_API_KEY?.trim();

const supabaseConfigured =
  Boolean(
    supabaseUrl &&
    supabaseServiceRoleKey
  );

const paystackConfigured =
  Boolean(
    paystackSecretKey
  );

const groqConfigured =
  Boolean(
    groqApiKey
  );

// ============================================================
// PAYSTACK MODE
// ============================================================

const paystackMode =
  paystackSecretKey?.startsWith(
    "sk_live_"
  )
    ? "live"
    : paystackSecretKey?.startsWith(
        "sk_test_"
      )
      ? "test"
      : "not-configured";

// ============================================================
// STARTUP ENVIRONMENT DEBUG
// ============================================================
//
// IMPORTANT:
// We DO NOT print secret keys.
//

console.log("");
console.log(
  "=================================================="
);
console.log(
  "🔧 ENVIRONMENT CHECK"
);
console.log(
  "=================================================="
);

console.log(
  `📁 Root .env:       ${ROOT_ENV_PATH}`
);

console.log(
  `🔐 SUPABASE_URL:    ${
    supabaseUrl
      ? "FOUND ✅"
      : "MISSING ❌"
  }`
);

console.log(
  `🔑 Supabase Admin:  ${
    supabaseServiceRoleKey
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
  "=================================================="
);
console.log("");

// ============================================================
// CORS
// ============================================================

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without Origin
      // such as Postman and server-to-server.
      if (!origin) {
        return callback(null, true);
      }

      const allowedOrigins = [
        FRONTEND_URL,
        "http://localhost:5173",
        "http://127.0.0.1:5173",
      ];

      if (
        allowedOrigins.includes(origin)
      ) {
        return callback(null, true);
      }

      // Development-friendly fallback.
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
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "x-paystack-signature",
    ],
  })
);

// ============================================================
// PAYSTACK WEBHOOK BODY
// ============================================================
//
// IMPORTANT:
//
// This middleware MUST come before express.json().
//
// Paystack webhook signature verification needs
// the original raw request body.
//

app.use(
  "/api/payments/webhook",
  express.raw({
    type: "application/json",
    limit: "2mb",
  })
);

// ============================================================
// JSON BODY
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
// ROOT
// ============================================================

app.get(
  "/",
  (req, res) => {
    res.status(200).json({
      success: true,

      message:
        "Scholiqen Backend is running",

      server:
        "online",

      environment:
        process.env.NODE_ENV ||
        "development",

      endpoints: {
        tutor:
          "/api/tutor",

        payments:
          "/api/payments",

        initializePayment:
          "POST /api/payments/initialize",

        verifyPayment:
          "GET /api/payments/verify/:reference",

        webhook:
          "POST /api/payments/webhook",

        health:
          "GET /api/health",
      },

      frontend:
        FRONTEND_URL,

      services: {
        supabase:
          supabaseConfigured,

        paystack:
          paystackConfigured,

        groq:
          groqConfigured,
      },
    });
  }
);

// ============================================================
// HEALTH CHECK
// ============================================================

app.get(
  "/api/health",
  (req, res) => {
    res.status(200).json({
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

      supabaseConfigured,

      groqConfigured,

      paystackConfigured,

      paystackMode,

      timestamp:
        new Date().toISOString(),
    });
  }
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
//
// POST /api/payments/initialize
//
// GET  /api/payments/verify/:reference
//
// POST /api/payments/webhook
//

app.use(
  "/api/payments",
  paymentRoutes
);

// ============================================================
// 404 HANDLER
// ============================================================

app.use(
  (req, res) => {
    console.log(
      `❌ Route not found: ${req.method} ${req.originalUrl}`
    );

    res.status(404).json({
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
      "❌ GLOBAL SERVER ERROR"
    );

    console.error(
      "=================================================="
    );

    console.error(
      error
    );

    console.error(
      "=================================================="
    );

    console.error("");

    if (res.headersSent) {
      return next(error);
    }

    const statusCode =
      Number(error?.status) >= 400 &&
      Number(error?.status) < 600
        ? Number(error.status)
        : 500;

    res.status(statusCode).json({
      success: false,

      error:
        statusCode === 500
          ? "Internal server error."
          : error?.message ||
            "Request failed.",
    });
  }
);

// ============================================================
// START SERVER
// ============================================================

app.listen(
  PORT,
  () => {
    console.log("");

    console.log(
      "=================================================="
    );

    console.log(
      "🚀 SCHOLIQEN BACKEND"
    );

    console.log(
      "=================================================="
    );

    console.log(
      `📡 Server:      http://localhost:${PORT}`
    );

    console.log(
      `🌐 Frontend:    ${FRONTEND_URL}`
    );

    console.log(
      `🤖 Tutor:       http://localhost:${PORT}/api/tutor`
    );

    console.log(
      `💳 Payments:    http://localhost:${PORT}/api/payments`
    );

    console.log(
      `💰 Initialize:  http://localhost:${PORT}/api/payments/initialize`
    );

    console.log(
      `🔍 Verify:      http://localhost:${PORT}/api/payments/verify/:reference`
    );

    console.log(
      `📦 Webhook:     http://localhost:${PORT}/api/payments/webhook`
    );

    console.log(
      `❤️ Health:      http://localhost:${PORT}/api/health`
    );

    console.log("");

    console.log(
      `🔐 Supabase:    ${
        supabaseConfigured
          ? "CONFIGURED ✅"
          : "MISSING ❌"
      }`
    );

    console.log(
      `🔑 Groq:        ${
        groqConfigured
          ? "CONFIGURED ✅"
          : "MISSING ❌"
      }`
    );

    console.log(
      `💳 Paystack:    ${
        paystackConfigured
          ? "CONFIGURED ✅"
          : "MISSING ❌"
      }`
    );

    console.log(
      `🔐 Paystack mode: ${
        paystackMode === "live"
          ? "LIVE 🔴"
          : paystackMode === "test"
            ? "TEST 🟡"
            : "NOT CONFIGURED ❌"
      }`
    );

    console.log("");

    console.log(
      "=================================================="
    );

    console.log("");
  }
);