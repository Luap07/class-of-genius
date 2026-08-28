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
// ├── .env
// ├── client/
// └── server/
//     ├── server.js
//     ├── routes/
//     └── lib/
//
// server.js is inside /server, so we explicitly load
// the .env file from the project root.
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
  console.warn("");
  console.warn("⚠️ Could not load root .env file.");
  console.warn(`📁 Expected location: ${ROOT_ENV_PATH}`);
  console.warn(`Reason: ${envResult.error.message}`);
  console.warn("");
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
// FRONTEND CONFIG
// ============================================================

const FRONTEND_URL =
  process.env.FRONTEND_URL?.trim() ||
  "http://localhost:5173";

// ============================================================
// ENVIRONMENT VARIABLES
// ============================================================
//
// IMPORTANT:
// Secret values are never sent to the frontend and are never
// printed to the terminal.
//

const supabaseUrl =
  process.env.SUPABASE_URL?.trim();

const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

const paystackSecretKey =
  process.env.PAYSTACK_SECRET_KEY?.trim();

const groqApiKey =
  process.env.GROQ_API_KEY?.trim();

// ============================================================
// CONFIGURATION STATUS
// ============================================================

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
  paystackSecretKey?.startsWith("sk_live_")
    ? "live"
    : paystackSecretKey?.startsWith("sk_test_")
      ? "test"
      : "not-configured";

// ============================================================
// UNIFIED PREMIUM PAYMENT CONFIGURATION
// ============================================================
//
// TEMPORARY TEST PRICE:
//
// Every premium product currently costs ₦100.
//
// Paystack expects amounts in KOBO, therefore:
//
// ₦100 = 10,000 kobo
//
// IMPORTANT:
// The frontend should NEVER be trusted to determine the amount.
// The backend/payment route should use this configuration.
//

const PREMIUM_PRICE_NAIRA = 100;

const PREMIUM_PRICE_KOBO =
  PREMIUM_PRICE_NAIRA * 100;

// ============================================================
// SUPPORTED PREMIUM PRODUCTS
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
// STARTUP ENVIRONMENT CHECK
// ============================================================
//
// IMPORTANT:
// Never print secret keys.
//

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
  `📁 Root .env:       ${ROOT_ENV_PATH}`
);

console.log(
  `🔐 Supabase URL:    ${
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
  `💰 Test Price:      ₦${PREMIUM_PRICE_NAIRA}`
);

console.log(
  `🪙 Paystack Amount: ${PREMIUM_PRICE_KOBO} kobo`
);

console.log(
  `📦 Products:        ${Object.keys(PREMIUM_PRODUCTS).length}`
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

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without an Origin header.
      // Useful for Postman and server-to-server requests.

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
      //
      // For production, replace this with strict
      // origin validation.
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
// PAYSTACK WEBHOOK RAW BODY
// ============================================================
//
// IMPORTANT:
//
// Paystack webhook signature verification requires the
// original request body.
//
// This MUST be registered before express.json().
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
        "Scholiqen Backend is running.",

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
// The payment router is responsible for:
//
// POST /api/payments/initialize
//
// GET  /api/payments/verify/:reference
//
// POST /api/payments/webhook
//
// The payment route should use the backend's
// PREMIUM_PRODUCTS configuration rather than trusting
// an amount supplied by the browser.
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
      `📡 Server:       http://localhost:${PORT}`
    );

    console.log(
      `🌐 Frontend:     ${FRONTEND_URL}`
    );

    console.log(
      `🤖 Tutor:        http://localhost:${PORT}/api/tutor`
    );

    console.log(
      `💳 Payments:     http://localhost:${PORT}/api/payments`
    );

    console.log(
      `💰 Initialize:   http://localhost:${PORT}/api/payments/initialize`
    );

    console.log(
      `🔍 Verify:       http://localhost:${PORT}/api/payments/verify/:reference`
    );

    console.log(
      `📦 Webhook:      http://localhost:${PORT}/api/payments/webhook`
    );

    console.log(
      `❤️ Health:       http://localhost:${PORT}/api/health`
    );

    console.log("");

    console.log(
      `🔐 Supabase:     ${
        supabaseConfigured
          ? "CONFIGURED ✅"
          : "MISSING ❌"
      }`
    );

    console.log(
      `🔑 Groq:         ${
        groqConfigured
          ? "CONFIGURED ✅"
          : "MISSING ❌"
      }`
    );

    console.log(
      `💳 Paystack:     ${
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

    console.log(
      `💰 Premium test price: ₦${PREMIUM_PRICE_NAIRA}`
    );

    console.log(
      `🪙 Paystack amount: ${PREMIUM_PRICE_KOBO} kobo`
    );

    console.log("");

    console.log(
      "📦 PREMIUM PRODUCTS"
    );

    Object.entries(
      PREMIUM_PRODUCTS
    ).forEach(
      ([key, product]) => {
        console.log(
          `   • ${key}: ${product.name} — ₦${product.priceNaira}`
        );
      }
    );

    console.log("");

    console.log(
      "=================================================="
    );

    console.log("");
  }
);
