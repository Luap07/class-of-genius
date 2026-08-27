import express from "express";

import {
  initializePayment,
  verifyPayment,
  paystackWebhook,
} from "../controllers/paymentController.js";

import {
  requireSupabaseUser,
} from "../middleware/requireSupabaseUser.js";

const router = express.Router();

// ============================================================
// INITIALIZE PAYMENT
// ============================================================
//
// Requires a logged-in Supabase user.
//
// POST /api/payments/initialize
//
// The controller can use req.user / req.userId
// to associate the payment with the logged-in account.
// ============================================================

router.post(
  "/initialize",
  requireSupabaseUser,
  initializePayment
);

// ============================================================
// VERIFY PAYMENT
// ============================================================
//
// The payment reference is enough for Paystack verification.
// Supabase authentication is not required here.
//
// GET /api/payments/verify/:reference
// ============================================================

router.get(
  "/verify/:reference",
  verifyPayment
);

// ============================================================
// PAYSTACK WEBHOOK
// ============================================================
//
// IMPORTANT:
// Do NOT add requireSupabaseUser here.
//
// Paystack sends this request directly to your server.
// The webhook controller must validate:
//
// x-paystack-signature
//
// using PAYSTACK_SECRET_KEY.
// ============================================================

router.post(
  "/webhook",
  paystackWebhook
);

// ============================================================
// EXPORT
// ============================================================

export default router;