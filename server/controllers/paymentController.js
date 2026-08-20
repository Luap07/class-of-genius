import crypto from "crypto";

import {
  initializePaystackTransaction,
  verifyPaystackTransaction,
} from "../services/paystackService.js";

const generateReference = () => {
  return `SCHOLIQEN-${Date.now()}-${crypto
    .randomBytes(4)
    .toString("hex")
    .toUpperCase()}`;
};

// ============================================================
// INITIALIZE PAYMENT
// POST /api/payments/initialize
// ============================================================

export const initializePayment = async (req, res) => {
  try {
    const {
      email,
      amount,
      productType,
      productId,
      productName,
      userId,
    } = req.body;

    // --------------------------------------------------------
    // VALIDATION
    // --------------------------------------------------------

    if (!email) {
      return res.status(400).json({
        success: false,
        error: "Email is required.",
      });
    }

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        error: "A valid payment amount is required.",
      });
    }

    if (!productType) {
      return res.status(400).json({
        success: false,
        error: "Product type is required.",
      });
    }

    if (!productId) {
      return res.status(400).json({
        success: false,
        error: "Product ID is required.",
      });
    }

    // --------------------------------------------------------
    // PAYSTACK AMOUNT
    //
    // Paystack expects the amount in kobo.
    // Example:
    // ₦5,000 = 500000 kobo
    // --------------------------------------------------------

    const amountInKobo = Math.round(
      Number(amount) * 100
    );

    const reference = generateReference();

    // --------------------------------------------------------
    // METADATA
    // --------------------------------------------------------

    const metadata = {
      userId: userId || null,
      productType,
      productId,
      productName: productName || null,
      platform: "Scholiqen",
    };

    // --------------------------------------------------------
    // INITIALIZE WITH PAYSTACK
    // --------------------------------------------------------

    const result =
      await initializePaystackTransaction({
        email,
        amount: amountInKobo,
        reference,
        metadata,
        callback_url:
          process.env.PAYSTACK_CALLBACK_URL ||
          "http://localhost:5173/payment/callback",
      });

    if (!result?.status) {
      return res.status(502).json({
        success: false,
        error: "Paystack could not initialize the payment.",
        details: result?.message,
      });
    }

    // --------------------------------------------------------
    // SUCCESS
    // --------------------------------------------------------

    return res.status(200).json({
      success: true,

      message: "Payment initialized successfully.",

      reference,

      authorization_url:
        result.data.authorization_url,

      access_code:
        result.data.access_code,

      product: {
        type: productType,
        id: productId,
        name: productName || null,
      },
    });
  } catch (error) {
    console.error(
      "❌ PAYMENT INITIALIZATION ERROR"
    );

    console.error(error?.response?.data || error);

    return res.status(500).json({
      success: false,
      error: "Unable to initialize payment.",
      details:
        error?.response?.data?.message ||
        error?.message ||
        "Unknown payment error.",
    });
  }
};

// ============================================================
// VERIFY PAYMENT
// GET /api/payments/verify/:reference
// ============================================================

export const verifyPayment = async (req, res) => {
  try {
    const { reference } = req.params;

    if (!reference) {
      return res.status(400).json({
        success: false,
        error: "Payment reference is required.",
      });
    }

    const result =
      await verifyPaystackTransaction(reference);

    if (!result?.status) {
      return res.status(400).json({
        success: false,
        error: "Unable to verify payment.",
        details: result?.message,
      });
    }

    const payment = result.data;

    const successful =
      payment.status === "success";

    return res.status(200).json({
      success: true,

      paid: successful,

      reference: payment.reference,

      status: payment.status,

      amount: payment.amount,

      currency: payment.currency,

      email: payment.customer?.email || null,

      paidAt: payment.paid_at || null,

      metadata: payment.metadata || null,

      message: successful
        ? "Payment verified successfully."
        : "Payment has not been completed.",
    });
  } catch (error) {
    console.error(
      "❌ PAYMENT VERIFICATION ERROR"
    );

    console.error(error?.response?.data || error);

    return res.status(500).json({
      success: false,
      error: "Unable to verify payment.",
      details:
        error?.response?.data?.message ||
        error?.message ||
        "Unknown payment error.",
    });
  }
};

// ============================================================
// PAYSTACK WEBHOOK
// POST /api/payments/webhook
// ============================================================

export const paystackWebhook = async (
  req,
  res
) => {
  try {
    const secret =
      process.env.PAYSTACK_SECRET_KEY;

    const signature =
      req.headers["x-paystack-signature"];

    if (!signature) {
      return res.status(401).send("Unauthorized");
    }

    const hash = crypto
      .createHmac("sha512", secret)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (hash !== signature) {
      return res.status(401).send("Invalid signature");
    }

    const event = req.body;

    console.log(
      "📦 Paystack webhook:",
      event.event
    );

    if (event.event === "charge.success") {
      const payment = event.data;

      console.log(
        "✅ Successful payment:",
        payment.reference
      );

      // IMPORTANT:
      // Later we will put database entitlement logic here.
      //
      // Example:
      //
      // give user access to LMS course
      // unlock CBT package
      // activate AI Tutor subscription
      // unlock novel
      // unlock virtual laboratory
    }

    return res.sendStatus(200);
  } catch (error) {
    console.error(
      "❌ PAYSTACK WEBHOOK ERROR",
      error
    );

    return res.sendStatus(500);
  }
};