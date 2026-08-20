import express from "express";

import {
  initializePayment,
  verifyPayment,
  paystackWebhook,
} from "../controllers/paymentController.js";

const router = express.Router();

// ============================================================
// INITIALIZE PAYMENT
// POST /api/payments/initialize
// ============================================================

router.post(
  "/initialize",
  initializePayment
);

// ============================================================
// VERIFY PAYMENT
// GET /api/payments/verify/:reference
// ============================================================

router.get(
  "/verify/:reference",
  verifyPayment
);

// ============================================================
// PAYSTACK WEBHOOK
// POST /api/payments/webhook
// ============================================================

router.post(
  "/webhook",
  paystackWebhook
);

// ============================================================
// EXPORT ROUTER
// ============================================================

export default router;