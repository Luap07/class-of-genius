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

/* ============================================================
   SCHOLIQEN PAYMENT ROUTES
============================================================ */

/*
  Premium products:

  - cbt
  - novel
  - multilingual
  - lms
  - virtual_lab

  TEST PRICE:

  - ₦100

  IMPORTANT:

  The frontend must NEVER be trusted to determine
  the payment amount.

  The backend/payment controller determines
  the actual amount.

  Paystack secret keys must remain on the server.
*/


/* ============================================================
   INITIALIZE PAYMENT
============================================================ */

/*
  POST /api/payments/initialize

  Authentication:
  REQUIRED

  The user must be logged into Supabase.

  Example request:

  {
    "productType": "cbt",
    "productId": "WAEC"
  }

  Novel:

  {
    "productType": "novel",
    "productId": "novel-id"
  }

  Multilingual:

  {
    "productType": "multilingual",
    "productId": "language-id"
  }

  LMS:

  {
    "productType": "lms",
    "productId": "course-id"
  }

  Virtual Lab:

  {
    "productType": "virtual_lab",
    "productId": "physics"
  }

  The controller is responsible for:

  1. Reading the authenticated user.
  2. Validating the product.
  3. Determining the server-side price.
  4. Converting ₦100 to 10,000 kobo.
  5. Creating the Paystack transaction.
  6. Saving the pending payment.
  7. Returning the Paystack authorization URL.

  DO NOT trust an amount supplied by the browser.
*/

router.post(
  "/initialize",
  requireSupabaseUser,
  initializePayment
);


/* ============================================================
   VERIFY PAYMENT
============================================================ */

/*
  GET /api/payments/verify/:reference

  Example:

  /api/payments/verify/SCHOLIQEN-123456789

  The route itself does not require Supabase authentication
  because Paystack redirects the customer back using the
  transaction reference.

  IMPORTANT:

  The controller MUST verify the transaction directly
  with Paystack.

  Never grant access simply because the frontend reports
  that the payment was successful.

  Verification should include:

  - Paystack transaction status
  - Payment reference
  - Expected amount
  - Currency
  - Local payment record
  - Product
  - Payment ownership where applicable

  Once verified successfully, the payment record should
  be marked as paid and the appropriate access should
  become available.
*/

router.get(
  "/verify/:reference",
  verifyPayment
);


/* ============================================================
   PAYSTACK WEBHOOK
============================================================ */

/*
  POST /api/payments/webhook

  Authentication:
  NOT REQUIRED

  Paystack calls this endpoint directly.

  DO NOT add requireSupabaseUser here.

  The webhook controller MUST:

  1. Read the raw request body.
  2. Read x-paystack-signature.
  3. Generate an HMAC SHA512 signature using
     PAYSTACK_SECRET_KEY.
  4. Compare the signatures securely.
  5. Reject invalid requests.
  6. Process successful payment events.
  7. Verify amount and currency.
  8. Mark the payment as paid.
  9. Prevent duplicate processing.

  server.js must register express.raw() for this
  endpoint BEFORE express.json().
*/

router.post(
  "/webhook",
  paystackWebhook
);


/* ============================================================
   EXPORT ROUTER
============================================================ */

export default router;
