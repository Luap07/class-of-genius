import crypto from "crypto";

import {
  initializePaystackTransaction,
  verifyPaystackTransaction,
} from "../services/paystackService.js";

import { supabaseAdmin } from "../lib/supabaseAdmin.js";

/* =========================================================
   REFERENCE
========================================================= */

const generateReference = () => {
  return `SCHOLIQEN-${Date.now()}-${crypto
    .randomBytes(5)
    .toString("hex")
    .toUpperCase()}`;
};

/* =========================================================
   INITIALIZE PAYMENT
   POST /api/payments/initialize
========================================================= */

export const initializePayment = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Authentication required.",
      });
    }

    const {
      email,
      amount,
      productType,
      productId,
      productName,
      storyId,
      storyTitle,
    } = req.body;

    /* -----------------------------------------------------
       VALIDATION
    ----------------------------------------------------- */

    if (!email && !user.email) {
      return res.status(400).json({
        success: false,
        error: "Email is required.",
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

    const numericAmount = Number(amount);

    if (
      !Number.isFinite(numericAmount) ||
      numericAmount <= 0
    ) {
      return res.status(400).json({
        success: false,
        error: "Invalid payment amount.",
      });
    }

    /* -----------------------------------------------------
       AMOUNT
    ----------------------------------------------------- */

    const amountInKobo = Math.round(
      numericAmount * 100
    );

    const reference = generateReference();

    /* -----------------------------------------------------
       CHECK EXISTING PAID ACCESS
    ----------------------------------------------------- */

    const {
      data: existingPayment,
      error: existingError,
    } = await supabaseAdmin
      .from("genre_payment_sessions")
      .select("*")
      .eq("user_id", user.id)
      .eq("genre", productId)
      .eq("status", "paid")
      .limit(1)
      .maybeSingle();

    if (existingError) {
      console.error(
        "❌ Existing payment lookup error:",
        existingError
      );

      return res.status(500).json({
        success: false,
        error: "Unable to check existing access.",
      });
    }

    if (existingPayment) {
      return res.status(409).json({
        success: false,
        alreadyPaid: true,
        error:
          "You already have access to this product.",
      });
    }

    /* -----------------------------------------------------
       METADATA
    ----------------------------------------------------- */

    const metadata = {
      userId: user.id,
      productType,
      productId,
      productName: productName || null,
      storyId: storyId || null,
      storyTitle: storyTitle || null,
      platform: "Scholiqen",
    };

    /* -----------------------------------------------------
       CALLBACK
    ----------------------------------------------------- */

    const callbackUrl =
      process.env.PAYSTACK_CALLBACK_URL ||
      "http://localhost:5173/payment";

    /* -----------------------------------------------------
       PAYSTACK
    ----------------------------------------------------- */

    const result =
      await initializePaystackTransaction({
        email: user.email || email,
        amount: amountInKobo,
        reference,
        metadata,
        callback_url: callbackUrl,
      });

    if (!result?.status) {
      return res.status(502).json({
        success: false,
        error:
          "Paystack could not initialize the payment.",
        details: result?.message || null,
      });
    }

    if (
      !result?.data?.authorization_url
    ) {
      return res.status(502).json({
        success: false,
        error:
          "Paystack did not return a payment authorization URL.",
      });
    }

    /* -----------------------------------------------------
       SAVE PAYMENT SESSION
    ----------------------------------------------------- */

    const {
      error: insertError,
    } = await supabaseAdmin
      .from("genre_payment_sessions")
      .insert({
        user_id: user.id,
        genre: productId,
        amount: numericAmount,
        reference,
        status: "pending",
        story_id: storyId || null,
        story_title: storyTitle || null,
        metadata,
        currency: "NGN",
      });

    if (insertError) {
      console.error(
        "❌ Payment session insert error:",
        insertError
      );

      return res.status(500).json({
        success: false,
        error:
          "Payment was initialized but could not be recorded.",
      });
    }

    /* -----------------------------------------------------
       RESPONSE
    ----------------------------------------------------- */

    return res.status(200).json({
      success: true,

      message:
        "Payment initialized successfully.",

      reference,

      authorization_url:
        result.data.authorization_url,

      access_code:
        result.data.access_code || null,

      product: {
        type: productType,
        id: productId,
        name: productName || null,
      },

      amount: numericAmount,

      currency: "NGN",
    });
  } catch (error) {
    console.error(
      "❌ PAYMENT INITIALIZATION ERROR"
    );

    console.error(
      error?.response?.data || error
    );

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

/* =========================================================
   VERIFY PAYMENT
   GET /api/payments/verify/:reference
========================================================= */

export const verifyPayment = async (req, res) => {
  try {
    const user = req.user;

    const { reference } = req.params;

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Authentication required.",
      });
    }

    if (!reference) {
      return res.status(400).json({
        success: false,
        error:
          "Payment reference is required.",
      });
    }

    /* -----------------------------------------------------
       VERIFY WITH PAYSTACK
    ----------------------------------------------------- */

    const result =
      await verifyPaystackTransaction(
        reference
      );

    if (!result?.status) {
      return res.status(400).json({
        success: false,
        paid: false,
        error:
          "Unable to verify payment.",
        details:
          result?.message || null,
      });
    }

    const payment = result.data;

    if (!payment) {
      return res.status(400).json({
        success: false,
        paid: false,
        error:
          "Paystack returned no payment data.",
      });
    }

    /* -----------------------------------------------------
       LOAD LOCAL PAYMENT
    ----------------------------------------------------- */

    const {
      data: localPayment,
      error: localError,
    } = await supabaseAdmin
      .from("genre_payment_sessions")
      .select("*")
      .eq("reference", reference)
      .eq("user_id", user.id)
      .maybeSingle();

    if (localError) {
      console.error(
        "❌ Local payment lookup error:",
        localError
      );

      return res.status(500).json({
        success: false,
        error:
          "Unable to find payment record.",
      });
    }

    if (!localPayment) {
      return res.status(404).json({
        success: false,
        error:
          "Payment record not found.",
      });
    }

    /* -----------------------------------------------------
       VERIFY AMOUNT
    ----------------------------------------------------- */

    const expectedAmount = Math.round(
      Number(localPayment.amount) * 100
    );

    const receivedAmount =
      Number(payment.amount);

    if (
      receivedAmount !== expectedAmount
    ) {
      console.error(
        "❌ Payment amount mismatch:",
        {
          reference,
          expectedAmount,
          receivedAmount,
        }
      );

      await supabaseAdmin
        .from("genre_payment_sessions")
        .update({
          status: "failed",
          metadata: payment,
        })
        .eq("id", localPayment.id);

      return res.status(400).json({
        success: false,
        paid: false,
        error:
          "Payment amount mismatch.",
      });
    }

    /* -----------------------------------------------------
       VERIFY CURRENCY
    ----------------------------------------------------- */

    const currency =
      payment.currency || "NGN";

    if (
      currency.toUpperCase() !== "NGN"
    ) {
      return res.status(400).json({
        success: false,
        paid: false,
        error:
          "Unsupported payment currency.",
      });
    }

    /* -----------------------------------------------------
       SUCCESS
    ----------------------------------------------------- */

    const successful =
      payment.status === "success";

    if (successful) {
      const {
        data: updatedPayment,
        error: updateError,
      } = await supabaseAdmin
        .from("genre_payment_sessions")
        .update({
          status: "paid",

          paid_at:
            payment.paid_at ||
            new Date().toISOString(),

          metadata: payment,

          currency,
        })
        .eq("id", localPayment.id)
        .select()
        .single();

      if (updateError) {
        console.error(
          "❌ Payment update error:",
          updateError
        );

        return res.status(500).json({
          success: false,
          error:
            "Payment was successful but access could not be updated.",
        });
      }

      return res.status(200).json({
        success: true,

        paid: true,

        reference:
          payment.reference,

        status:
          payment.status,

        amount:
          payment.amount,

        currency,

        email:
          payment.customer?.email ||
          null,

        paidAt:
          payment.paid_at ||
          null,

        metadata:
          payment.metadata ||
          null,

        paymentRecord:
          updatedPayment,

        message:
          "Payment verified successfully.",
      });
    }

    /* -----------------------------------------------------
       NOT SUCCESSFUL
    ----------------------------------------------------- */

    const newStatus =
      payment.status === "failed"
        ? "failed"
        : "pending";

    await supabaseAdmin
      .from("genre_payment_sessions")
      .update({
        status: newStatus,
        metadata: payment,
      })
      .eq("id", localPayment.id);

    return res.status(200).json({
      success: true,

      paid: false,

      reference:
        payment.reference,

      status:
        payment.status,

      amount:
        payment.amount,

      currency,

      email:
        payment.customer?.email ||
        null,

      paidAt:
        payment.paid_at ||
        null,

      metadata:
        payment.metadata ||
        null,

      message:
        "Payment has not been completed.",
    });
  } catch (error) {
    console.error(
      "❌ PAYMENT VERIFICATION ERROR"
    );

    console.error(
      error?.response?.data || error
    );

    return res.status(500).json({
      success: false,
      error:
        "Unable to verify payment.",
      details:
        error?.response?.data?.message ||
        error?.message ||
        "Unknown payment error.",
    });
  }
};

/* =========================================================
   PAYSTACK WEBHOOK
   POST /api/payments/webhook
========================================================= */

export const paystackWebhook = async (
  req,
  res
) => {
  try {
    const secret =
      process.env.PAYSTACK_SECRET_KEY?.trim();

    const signature =
      req.headers[
        "x-paystack-signature"
      ];

    /* -----------------------------------------------------
       CHECK SECRET
    ----------------------------------------------------- */

    if (!secret) {
      console.error(
        "❌ PAYSTACK_SECRET_KEY is missing."
      );

      return res.sendStatus(500);
    }

    /* -----------------------------------------------------
       CHECK SIGNATURE
    ----------------------------------------------------- */

    if (!signature) {
      console.error(
        "❌ Paystack signature missing."
      );

      return res
        .status(401)
        .send("Unauthorized");
    }

    /* -----------------------------------------------------
       RAW BODY
       
       server.js uses express.raw() for this route.
       Therefore req.body is a Buffer.
    ----------------------------------------------------- */

    const rawBody = Buffer.isBuffer(
      req.body
    )
      ? req.body
      : Buffer.from(
          JSON.stringify(req.body || {})
        );

    /* -----------------------------------------------------
       GENERATE HMAC
    ----------------------------------------------------- */

    const hash =
      crypto
        .createHmac(
          "sha512",
          secret
        )
        .update(rawBody)
        .digest("hex");

    /* -----------------------------------------------------
       SAFE SIGNATURE COMPARISON
    ----------------------------------------------------- */

    const hashBuffer =
      Buffer.from(hash, "utf8");

    const signatureBuffer =
      Buffer.from(
        String(signature),
        "utf8"
      );

    if (
      hashBuffer.length !==
      signatureBuffer.length
    ) {
      return res
        .status(401)
        .send("Invalid signature");
    }

    if (
      !crypto.timingSafeEqual(
        hashBuffer,
        signatureBuffer
      )
    ) {
      console.error(
        "❌ Invalid Paystack webhook signature."
      );

      return res
        .status(401)
        .send("Invalid signature");
    }

    /* -----------------------------------------------------
       PARSE EVENT
    ----------------------------------------------------- */

    let event;

    try {
      event = JSON.parse(
        rawBody.toString("utf8")
      );
    } catch (parseError) {
      console.error(
        "❌ Invalid Paystack webhook JSON:",
        parseError
      );

      return res
        .status(400)
        .send("Invalid JSON");
    }

    console.log(
      "📦 Paystack webhook:",
      event?.event
    );

    /* -----------------------------------------------------
       SUCCESSFUL CHARGE
    ----------------------------------------------------- */

    if (
      event?.event !==
      "charge.success"
    ) {
      return res.sendStatus(200);
    }

    const payment = event.data;

    if (!payment) {
      return res.sendStatus(200);
    }

    const reference =
      payment.reference;

    if (!reference) {
      return res.sendStatus(200);
    }

    /* -----------------------------------------------------
       FIND LOCAL PAYMENT
    ----------------------------------------------------- */

    const {
      data: localPayment,
      error: lookupError,
    } = await supabaseAdmin
      .from("genre_payment_sessions")
      .select("*")
      .eq("reference", reference)
      .maybeSingle();

    if (lookupError) {
      console.error(
        "❌ Webhook payment lookup error:",
        lookupError
      );

      return res.sendStatus(500);
    }

    if (!localPayment) {
      console.warn(
        "⚠️ Webhook payment not found:",
        reference
      );

      return res.sendStatus(200);
    }

    /* -----------------------------------------------------
       IDEMPOTENCY
    ----------------------------------------------------- */

    if (
      localPayment.status ===
      "paid"
    ) {
      console.log(
        "ℹ️ Payment already marked paid:",
        reference
      );

      return res.sendStatus(200);
    }

    /* -----------------------------------------------------
       VERIFY AMOUNT
    ----------------------------------------------------- */

    const expectedAmount =
      Math.round(
        Number(
          localPayment.amount
        ) * 100
      );

    const receivedAmount =
      Number(payment.amount);

    if (
      receivedAmount !==
      expectedAmount
    ) {
      console.error(
        "❌ Webhook amount mismatch:",
        {
          reference,
          expectedAmount,
          receivedAmount,
        }
      );

      await supabaseAdmin
        .from(
          "genre_payment_sessions"
        )
        .update({
          status: "failed",
          metadata: payment,
        })
        .eq(
          "id",
          localPayment.id
        );

      return res.sendStatus(200);
    }

    /* -----------------------------------------------------
       VERIFY CURRENCY
    ----------------------------------------------------- */

    const currency =
      payment.currency || "NGN";

    if (
      currency.toUpperCase() !==
      "NGN"
    ) {
      console.error(
        "❌ Webhook currency mismatch:",
        {
          reference,
          currency,
        }
      );

      return res.sendStatus(200);
    }

    /* -----------------------------------------------------
       MARK PAID
    ----------------------------------------------------- */

    const {
      error: updateError,
    } = await supabaseAdmin
      .from(
        "genre_payment_sessions"
      )
      .update({
        status: "paid",

        paid_at:
          payment.paid_at ||
          new Date().toISOString(),

        currency,

        metadata: payment,
      })
      .eq(
        "id",
        localPayment.id
      );

    if (updateError) {
      console.error(
        "❌ Webhook payment update error:",
        updateError
      );

      return res.sendStatus(500);
    }

    console.log(
      "✅ Payment marked paid:",
      reference
    );

    return res.sendStatus(200);
  } catch (error) {
    console.error(
      "❌ PAYSTACK WEBHOOK ERROR"
    );

    console.error(error);

    return res.sendStatus(500);
  }
};