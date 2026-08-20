import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import tutorRoutes from "./routes/tutorRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;

// ============================================================
// CORS
// ============================================================

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

// ============================================================
// JSON
// ============================================================

app.use(express.json({ limit: "2mb" }));

// ============================================================
// ROOT
// ============================================================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Scholiqen Backend is running",
    server: "online",

    endpoints: {
      tutor: "/api/tutor",
      payments: "/api/payments",
      initializePayment: "/api/payments/initialize",
      verifyPayment: "/api/payments/verify/:reference",
      webhook: "/api/payments/webhook",
      health: "/api/health",
    },
  });
});

// ============================================================
// HEALTH CHECK
// ============================================================

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    server: "online",

    groqConfigured:
      Boolean(process.env.GROQ_API_KEY),

    paystackConfigured:
      Boolean(process.env.PAYSTACK_SECRET_KEY),

    timestamp:
      new Date().toISOString(),
  });
});

// ============================================================
// AI TUTOR ROUTE
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
// 404 HANDLER
// ============================================================

app.use((req, res) => {
  console.log(
    `❌ Route not found: ${req.method} ${req.originalUrl}`
  );

  res.status(404).json({
    success: false,
    error: "Route not found.",
    path: req.originalUrl,
    method: req.method,
  });
});

// ============================================================
// GLOBAL ERROR HANDLER
// ============================================================

app.use(
  (error, req, res, next) => {
    console.error(
      "=================================================="
    );

    console.error(
      "❌ GLOBAL SERVER ERROR"
    );

    console.error(
      "=================================================="
    );

    console.error(error);

    if (res.headersSent) {
      return next(error);
    }

    res.status(500).json({
      success: false,
      error: "Internal server error.",
    });
  }
);

// ============================================================
// START SERVER
// ============================================================

app.listen(PORT, () => {
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
    `📡 Server:  http://localhost:${PORT}`
  );

  console.log(
    `🤖 Tutor:   http://localhost:${PORT}/api/tutor`
  );

  console.log(
    `💳 Payment: http://localhost:${PORT}/api/payments`
  );

  console.log(
    `💰 Initialize: http://localhost:${PORT}/api/payments/initialize`
  );

  console.log(
    `🔍 Verify:  http://localhost:${PORT}/api/payments/verify/:reference`
  );

  console.log(
    `❤️ Health:  http://localhost:${PORT}/api/health`
  );

  console.log(
    `🔑 Groq:    ${
      process.env.GROQ_API_KEY
        ? "CONFIGURED ✅"
        : "MISSING ❌"
    }`
  );

  console.log(
    `💳 Paystack: ${
      process.env.PAYSTACK_SECRET_KEY
        ? "CONFIGURED ✅"
        : "MISSING ❌"
    }`
  );

  console.log(
    "=================================================="
  );

  console.log("");
});