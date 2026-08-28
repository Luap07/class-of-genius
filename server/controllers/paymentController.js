import crypto from "crypto";

import {
  initializePaystackTransaction,
  verifyPaystackTransaction,
} from "../services/paystackService.js";

import { supabaseAdmin } from "../lib/supabaseAdmin.js";

/* ============================================================
   PAYMENT CONFIGURATION
============================================================ */

const PAYMENT_CURRENCY = "NGN";

/*
  EVERY PRODUCT CURRENTLY COSTS ₦100.

  IMPORTANT:
  The frontend cannot change this amount.

  ₦100 = 10,000 kobo.
*/

const PAYMENT_AMOUNT = 100;

const PAYMENT_AMOUNT_KOBO =
  PAYMENT_AMOUNT * 100;


/* ============================================================
   SUPPORTED PRODUCT TYPES
============================================================ */

const SUPPORTED_PRODUCT_TYPES = [
  "cbt",
  "novel",
  "multilingual",
  "lms",
  "lab",
  "course",
  "document",
  "language",
  "subscription",
  "other",
];


/* ============================================================
   GENERATE PAYMENT REFERENCE
============================================================ */

const generateReference = () => {
  return `SCHOLIQEN-${Date.now()}-${crypto
    .randomBytes(5)
    .toString("hex")
    .toUpperCase()}`;
};


/* ============================================================
   NORMALIZE PRODUCT TYPE
============================================================ */

const normalizeProductType = (value) => {
  return String(value || "")
    .trim()
    .toLowerCase();
};


/* ============================================================
   CLEAN STRING
============================================================ */

const cleanString = (value) => {
  if (
    value === undefined ||
    value === null
  ) {
    return null;
  }

  const cleaned = String(value).trim();

  return cleaned || null;
};


/* ============================================================
   CHECK EXISTING PAID ACCESS
============================================================ */

const findExistingPaidPayment = async ({
  userId,
  productType,
  productId,
}) => {
  const {
    data,
    error,
  } = await supabaseAdmin
    .from("payments")
    .select("*")
    .eq("user_id", userId)
    .eq("product_type", productType)
    .eq("product_id", productId)
    .eq("status", "paid")
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
};


/* ============================================================
   INITIALIZE PAYMENT
   POST /api/payments/initialize
============================================================ */

export const initializePayment = async (
  req,
  res
) => {
  try {
    /* --------------------------------------------------------
       AUTHENTICATED USER
    -------------------------------------------------------- */

    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        error:
          "Authentication required.",
      });
    }


    /* --------------------------------------------------------
       REQUEST DATA
    -------------------------------------------------------- */

    const {
      email,
      productType,
      productId,
      productName,

      storyId,
      storyTitle,

      courseId,
      courseTitle,

      subject,
      exam,

      metadata: frontendMetadata,
    } = req.body || {};


    /* --------------------------------------------------------
       CLEAN VALUES
    -------------------------------------------------------- */

    const normalizedProductType =
      normalizeProductType(
        productType
      );

    const normalizedProductId =
      cleanString(productId);

    const normalizedProductName =
      cleanString(productName);

    const customerEmail =
      cleanString(user.email) ||
      cleanString(email);


    /* --------------------------------------------------------
       VALIDATION
    -------------------------------------------------------- */

    if (!customerEmail) {
      return res.status(400).json({
        success: false,
        error:
          "A valid email address is required.",
      });
    }


    if (!normalizedProductType) {
      return res.status(400).json({
        success: false,
        error:
          "Product type is required.",
      });
    }


    if (
      !SUPPORTED_PRODUCT_TYPES.includes(
        normalizedProductType
      )
    ) {
      return res.status(400).json({
        success: false,

        error:
          "Unsupported product type.",

        supportedProducts:
          SUPPORTED_PRODUCT_TYPES,
      });
    }


    if (!normalizedProductId) {
      return res.status(400).json({
        success: false,
        error:
          "Product ID is required.",
      });
    }


    /* --------------------------------------------------------
       FIXED PRICE
    -------------------------------------------------------- */

    /*
      DO NOT TRUST req.body.amount.

      Even if someone sends:

      {
        amount: 1
      }

      or:

      {
        amount: 100000
      }

      the server still charges ₦100.
    */

    const numericAmount =
      PAYMENT_AMOUNT;

    const amountInKobo =
      PAYMENT_AMOUNT_KOBO;


    /* --------------------------------------------------------
       CHECK EXISTING PAID ACCESS
    -------------------------------------------------------- */

    let existingPayment;

    try {
      existingPayment =
        await findExistingPaidPayment({
          userId: user.id,

          productType:
            normalizedProductType,

          productId:
            normalizedProductId,
        });
    } catch (lookupError) {
      console.error(
        "❌ Existing payment lookup error:",
        lookupError
      );

      return res.status(500).json({
        success: false,
        error:
          "Unable to check existing access.",
      });
    }


    if (existingPayment) {
      return res.status(409).json({
        success: false,

        alreadyPaid: true,

        paid: true,

        error:
          "You already have access to this product.",

        product: {
          type:
            normalizedProductType,

          id:
            normalizedProductId,

          name:
            normalizedProductName,
        },

        amount:
          PAYMENT_AMOUNT,

        currency:
          PAYMENT_CURRENCY,
      });
    }


    /* --------------------------------------------------------
       GENERATE REFERENCE
    -------------------------------------------------------- */

    const reference =
      generateReference();


    /* --------------------------------------------------------
       SAFE FRONTEND METADATA
    -------------------------------------------------------- */

    const safeFrontendMetadata =
      frontendMetadata &&
      typeof frontendMetadata === "object" &&
      !Array.isArray(frontendMetadata)
        ? frontendMetadata
        : {};


    /* --------------------------------------------------------
       PAYMENT METADATA
    -------------------------------------------------------- */

    const metadata = {
      ...safeFrontendMetadata,

      userId:
        user.id,

      productType:
        normalizedProductType,

      productId:
        normalizedProductId,

      productName:
        normalizedProductName,

      storyId:
        cleanString(storyId),

      storyTitle:
        cleanString(storyTitle),

      courseId:
        cleanString(courseId),

      courseTitle:
        cleanString(courseTitle),

      subject:
        cleanString(subject),

      exam:
        cleanString(exam),

      platform:
        "Scholiqen",

      amount:
        numericAmount,

      currency:
        PAYMENT_CURRENCY,
    };


    /* --------------------------------------------------------
       CALLBACK URL
    -------------------------------------------------------- */

    const callbackUrl =
      process.env.PAYSTACK_CALLBACK_URL ||
      `${
        process.env.FRONTEND_URL ||
        "http://localhost:5173"
      }/payment`;


    /* --------------------------------------------------------
       LOG PAYMENT INITIALIZATION
    -------------------------------------------------------- */

    console.log(
      "=================================================="
    );

    console.log(
      "💳 INITIALIZING PAYMENT"
    );

    console.log(
      "=================================================="
    );

    console.log(
      "Reference:",
      reference
    );

    console.log(
      "User:",
      user.id
    );

    console.log(
      "Product:",
      normalizedProductType
    );

    console.log(
      "Product ID:",
      normalizedProductId
    );

    console.log(
      "Amount:",
      `₦${numericAmount}`
    );

    console.log(
      "Currency:",
      PAYMENT_CURRENCY
    );

    console.log(
      "=================================================="
    );


    /* --------------------------------------------------------
       INITIALIZE PAYSTACK
    -------------------------------------------------------- */

    const result =
      await initializePaystackTransaction({
        email:
          customerEmail,

        amount:
          amountInKobo,

        reference,

        metadata,

        callback_url:
          callbackUrl,
      });


    /* --------------------------------------------------------
       PAYSTACK RESPONSE VALIDATION
    -------------------------------------------------------- */

    if (!result?.status) {
      console.error(
        "❌ Paystack initialization failed:",
        result
      );

      return res.status(502).json({
        success: false,

        error:
          "Paystack could not initialize the payment.",

        details:
          result?.message ||
          null,
      });
    }


    const authorizationUrl =
      result?.data?.authorization_url;


    if (!authorizationUrl) {
      console.error(
        "❌ Paystack returned no authorization URL:",
        result
      );

      return res.status(502).json({
        success: false,

        error:
          "Paystack did not return a payment authorization URL.",
      });
    }


    /* --------------------------------------------------------
       SAVE PAYMENT
    -------------------------------------------------------- */

    const {
      data: paymentRecord,
      error: insertError,
    } = await supabaseAdmin
      .from("payments")
      .insert({
        user_id:
          user.id,

        product_type:
          normalizedProductType,

        product_id:
          normalizedProductId,

        product_name:
          normalizedProductName,

        amount:
          numericAmount,

        currency:
          PAYMENT_CURRENCY,

        reference,

        status:
          "pending",

        story_id:
          cleanString(storyId),

        story_title:
          cleanString(storyTitle),

        metadata,
      })
      .select()
      .single();


    if (insertError) {
      console.error(
        "❌ Payment insert error:",
        insertError
      );

      /*
        Paystack has already created the transaction.

        The transaction reference is returned so the payment
        can still be reconciled manually if necessary.
      */

      return res.status(500).json({
        success: false,

        error:
          "Payment was initialized but could not be recorded.",

        reference,
      });
    }


    /* --------------------------------------------------------
       RESPONSE
    -------------------------------------------------------- */

    return res.status(200).json({
      success: true,

      message:
        "Payment initialized successfully.",

      reference,

      authorization_url:
        authorizationUrl,

      access_code:
        result?.data?.access_code ||
        null,

      amount:
        numericAmount,

      amountInKobo:
        amountInKobo,

      currency:
        PAYMENT_CURRENCY,

      product: {
        type:
          normalizedProductType,

        id:
          normalizedProductId,

        name:
          normalizedProductName,
      },

      payment:
        paymentRecord,
    });
  } catch (error) {
    console.error(
      "❌ PAYMENT INITIALIZATION ERROR"
    );

    console.error(
      error?.response?.data ||
      error
    );

    return res.status(500).json({
      success: false,

      error:
        "Unable to initialize payment.",

      details:
        error?.response?.data?.message ||
        error?.message ||
        "Unknown payment error.",
    });
  }
};


/* ============================================================
   VERIFY PAYMENT
   GET /api/payments/verify/:reference
============================================================ */

export const verifyPayment = async (
  req,
  res
) => {
  try {
    const user =
      req.user;

    const reference =
      cleanString(
        req.params?.reference
      );


    /* --------------------------------------------------------
       AUTHENTICATION
    -------------------------------------------------------- */

    if (!user) {
      return res.status(401).json({
        success: false,

        paid: false,

        error:
          "Authentication required.",
      });
    }


    /* --------------------------------------------------------
       REFERENCE
    -------------------------------------------------------- */

    if (!reference) {
      return res.status(400).json({
        success: false,

        paid: false,

        error:
          "Payment reference is required.",
      });
    }


    /* --------------------------------------------------------
       VERIFY WITH PAYSTACK
    -------------------------------------------------------- */

    console.log(
      "🔍 Verifying payment:",
      reference
    );

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
          result?.message ||
          null,
      });
    }


    const payment =
      result?.data;


    if (!payment) {
      return res.status(400).json({
        success: false,

        paid: false,

        error:
          "Paystack returned no payment data.",
      });
    }


    /* --------------------------------------------------------
       LOAD LOCAL PAYMENT
    -------------------------------------------------------- */

    const {
      data: localPayment,
      error: localError,
    } =
      await supabaseAdmin
        .from("payments")
        .select("*")
        .eq(
          "reference",
          reference
        )
        .eq(
          "user_id",
          user.id
        )
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

        paid: false,

        error:
          "Payment record not found.",
      });
    }


    /* --------------------------------------------------------
       VERIFY AMOUNT
    -------------------------------------------------------- */

    const expectedAmount =
      Math.round(
        Number(
          localPayment.amount
        ) * 100
      );

    const receivedAmount =
      Number(
        payment.amount
      );


    if (
      receivedAmount !==
      expectedAmount
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
        .from("payments")
        .update({
          status:
            "failed",

          metadata:
            payment,
        })
        .eq(
          "id",
          localPayment.id
        );


      return res.status(400).json({
        success: false,

        paid: false,

        error:
          "Payment amount mismatch.",
      });
    }


    /* --------------------------------------------------------
       VERIFY CURRENCY
    -------------------------------------------------------- */

    const currency =
      cleanString(
        payment.currency
      ) ||
      PAYMENT_CURRENCY;


    if (
      currency.toUpperCase() !==
      PAYMENT_CURRENCY
    ) {
      console.error(
        "❌ Unsupported payment currency:",
        currency
      );

      return res.status(400).json({
        success: false,

        paid: false,

        error:
          "Unsupported payment currency.",
      });
    }


    /* --------------------------------------------------------
       PAYMENT STATUS
    -------------------------------------------------------- */

    const successful =
      payment.status ===
      "success";


    /* --------------------------------------------------------
       SUCCESSFUL PAYMENT
    -------------------------------------------------------- */

    if (successful) {
      const {
        data: updatedPayment,

        error: updateError,
      } =
        await supabaseAdmin
          .from("payments")
          .update({
            status:
              "paid",

            paid_at:
              payment.paid_at ||
              new Date().toISOString(),

            currency:

              PAYMENT_CURRENCY,

            metadata:
              payment,
          })
          .eq(
            "id",
            localPayment.id
          )
          .select()
          .single();


      if (updateError) {
        console.error(
          "❌ Payment update error:",
          updateError
        );

        return res.status(500).json({
          success: false,

          paid: true,

          error:
            "Payment was successful but access could not be updated.",
        });
      }


      console.log(
        "=================================================="
      );

      console.log(
        "✅ PAYMENT VERIFIED"
      );

      console.log(
        "=================================================="
      );

      console.log(
        "Reference:",
        reference
      );

      console.log(
        "User:",
        user.id
      );

      console.log(
        "Product:",
        localPayment.product_type
      );

      console.log(
        "Product ID:",
        localPayment.product_id
      );

      console.log(
        "Amount:",
        `₦${localPayment.amount}`
      );

      console.log(
        "Status:",
        "paid"
      );

      console.log(
        "=================================================="
      );


      return res.status(200).json({
        success: true,

        paid: true,

        reference:
          payment.reference,

        status:
          payment.status,

        amount:
          payment.amount,

        currency:
          PAYMENT_CURRENCY,

        email:
          payment.customer?.email ||
          null,

        paidAt:
          payment.paid_at ||
          new Date().toISOString(),

        product: {
          type:
            localPayment.product_type,

          id:
            localPayment.product_id,

          name:
            localPayment.product_name ||
            null,
        },

        paymentRecord:
          updatedPayment,

        message:
          "Payment verified successfully.",
      });
    }


    /* --------------------------------------------------------
       PAYMENT NOT SUCCESSFUL
    -------------------------------------------------------- */

    const newStatus =
      payment.status ===
      "failed"
        ? "failed"
        : "pending";


    await supabaseAdmin
      .from("payments")
      .update({
        status:
          newStatus,

        metadata:
          payment,
      })
      .eq(
        "id",
        localPayment.id
      );


    return res.status(200).json({
      success: true,

      paid: false,

      reference:
        payment.reference,

      status:
        payment.status,

      amount:
        payment.amount,

      currency:
        PAYMENT_CURRENCY,

      email:
        payment.customer?.email ||
        null,

      paidAt:
        payment.paid_at ||
        null,

      product: {
        type:
          localPayment.product_type,

        id:
          localPayment.product_id,

        name:
          localPayment.product_name ||
          null,
      },

      message:
        "Payment has not been completed.",
    });
  } catch (error) {
    console.error(
      "❌ PAYMENT VERIFICATION ERROR"
    );

    console.error(
      error?.response?.data ||
      error
    );

    return res.status(500).json({
      success: false,

      paid: false,

      error:
        "Unable to verify payment.",

      details:
        error?.response?.data?.message ||
        error?.message ||
        "Unknown payment error.",
    });
  }
};


/* ============================================================
   PAYSTACK WEBHOOK
   POST /api/payments/webhook
============================================================ */

export const paystackWebhook = async (
  req,
  res
) => {
  try {
    /* --------------------------------------------------------
       SECRET
    -------------------------------------------------------- */

    const secret =
      process.env
        .PAYSTACK_SECRET_KEY?.trim();


    if (!secret) {
      console.error(
        "❌ PAYSTACK_SECRET_KEY is missing."
      );

      return res.sendStatus(
        500
      );
    }


    /* --------------------------------------------------------
       SIGNATURE
    -------------------------------------------------------- */

    const signature =
      req.headers[
        "x-paystack-signature"
      ];


    if (!signature) {
      console.error(
        "❌ Paystack signature missing."
      );

      return res
        .status(401)
        .send(
          "Unauthorized"
        );
    }


    /* --------------------------------------------------------
       RAW BODY
    -------------------------------------------------------- */

    const rawBody =
      Buffer.isBuffer(req.body)
        ? req.body
        : Buffer.from(
            JSON.stringify(
              req.body || {}
            )
          );


    /* --------------------------------------------------------
       CREATE HMAC
    -------------------------------------------------------- */

    const hash =
      crypto
        .createHmac(
          "sha512",
          secret
        )
        .update(rawBody)
        .digest("hex");


    /* --------------------------------------------------------
       SAFE SIGNATURE COMPARISON
    -------------------------------------------------------- */

    const hashBuffer =
      Buffer.from(
        hash,
        "utf8"
      );

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
        .send(
          "Invalid signature"
        );
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
        .send(
          "Invalid signature"
        );
    }


    /* --------------------------------------------------------
       PARSE EVENT
    -------------------------------------------------------- */

    let event;

    try {
      event =
        JSON.parse(
          rawBody.toString(
            "utf8"
          )
        );
    } catch (parseError) {
      console.error(
        "❌ Invalid Paystack webhook JSON:",
        parseError
      );

      return res
        .status(400)
        .send(
          "Invalid JSON"
        );
    }


    console.log(
      "📦 Paystack webhook:",
      event?.event
    );


    /* --------------------------------------------------------
       ONLY HANDLE SUCCESSFUL CHARGES
    -------------------------------------------------------- */

    if (
      event?.event !==
      "charge.success"
    ) {
      return res.sendStatus(
        200
      );
    }


    const payment =
      event?.data;


    if (!payment) {
      return res.sendStatus(
        200
      );
    }


    const reference =
      cleanString(
        payment.reference
      );


    if (!reference) {
      return res.sendStatus(
        200
      );
    }


    /* --------------------------------------------------------
       FIND LOCAL PAYMENT
    -------------------------------------------------------- */

    const {
      data: localPayment,

      error: lookupError,
    } =
      await supabaseAdmin
        .from("payments")
        .select("*")
        .eq(
          "reference",
          reference
        )
        .maybeSingle();


    if (lookupError) {
      console.error(
        "❌ Webhook payment lookup error:",
        lookupError
      );

      return res.sendStatus(
        500
      );
    }


    /* --------------------------------------------------------
       PAYMENT NOT FOUND
    -------------------------------------------------------- */

    if (!localPayment) {
      console.warn(
        "⚠️ Webhook payment not found:",
        reference
      );

      return res.sendStatus(
        200
      );
    }


    /* --------------------------------------------------------
       IDEMPOTENCY
    -------------------------------------------------------- */

    if (
      localPayment.status ===
      "paid"
    ) {
      console.log(
        "ℹ️ Payment already marked paid:",
        reference
      );

      return res.sendStatus(
        200
      );
    }


    /* --------------------------------------------------------
       VERIFY AMOUNT
    -------------------------------------------------------- */

    const expectedAmount =
      Math.round(
        Number(
          localPayment.amount
        ) * 100
      );

    const receivedAmount =
      Number(
        payment.amount
      );


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
        .from("payments")
        .update({
          status:
            "failed",

          metadata:
            payment,
        })
        .eq(
          "id",
          localPayment.id
        );

      return res.sendStatus(
        200
      );
    }


    /* --------------------------------------------------------
       VERIFY CURRENCY
    -------------------------------------------------------- */

    const currency =
      cleanString(
        payment.currency
      ) ||
      PAYMENT_CURRENCY;


    if (
      currency.toUpperCase() !==
      PAYMENT_CURRENCY
    ) {
      console.error(
        "❌ Webhook currency mismatch:",
        {
          reference,

          currency,
        }
      );

      return res.sendStatus(
        200
      );
    }


    /* --------------------------------------------------------
       VERIFY PAYSTACK STATUS
    -------------------------------------------------------- */

    if (
      payment.status !==
      "success"
    ) {
      console.warn(
        "⚠️ Webhook payment status is not success:",
        payment.status
      );

      return res.sendStatus(
        200
      );
    }


    /* --------------------------------------------------------
       MARK PAYMENT AS PAID
    -------------------------------------------------------- */

    const {
      data: updatedPayment,

      error: updateError,
    } =
      await supabaseAdmin
        .from("payments")
        .update({
          status:
            "paid",

          paid_at:
            payment.paid_at ||
            new Date().toISOString(),

          currency:
            PAYMENT_CURRENCY,

          metadata:
            payment,
        })
        .eq(
          "id",
          localPayment.id
        )
        .select()
        .single();


    if (updateError) {
      console.error(
        "❌ Webhook payment update error:",
        updateError
      );

      return res.sendStatus(
        500
      );
    }


    /* --------------------------------------------------------
       SUCCESS LOG
    -------------------------------------------------------- */

    console.log(
      "=================================================="
    );

    console.log(
      "✅ PAYMENT COMPLETED"
    );

    console.log(
      "=================================================="
    );

    console.log(
      "Reference:",
      reference
    );

    console.log(
      "User:",
      localPayment.user_id
    );

    console.log(
      "Product:",
      localPayment.product_type
    );

    console.log(
      "Product ID:",
      localPayment.product_id
    );

    console.log(
      "Amount:",
      `₦${localPayment.amount}`
    );

    console.log(
      "Currency:",
      localPayment.currency
    );

    console.log(
      "Status:",
      updatedPayment?.status
    );

    console.log(
      "=================================================="
    );


    return res.sendStatus(
      200
    );
  } catch (error) {
    console.error(
      "❌ PAYSTACK WEBHOOK ERROR"
    );

    console.error(
      error?.response?.data ||
      error
    );

    return res.sendStatus(
      500
    );
  }
};