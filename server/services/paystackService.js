import axios from "axios";

/* =========================================================
   PAYSTACK CONFIGURATION
========================================================= */

const PAYSTACK_SECRET_KEY =
  process.env.PAYSTACK_SECRET_KEY?.trim();

const PAYSTACK_BASE_URL =
  "https://api.paystack.co";

/* =========================================================
   ENVIRONMENT CHECK
========================================================= */

if (!PAYSTACK_SECRET_KEY) {
  console.error(
    "❌ PAYSTACK_SECRET_KEY is missing."
  );
  console.error(
    "Add PAYSTACK_SECRET_KEY=sk_test_... to your root .env file."
  );
}

/* =========================================================
   PAYSTACK CLIENT
========================================================= */

const paystack = axios.create({
  baseURL: PAYSTACK_BASE_URL,

  timeout: 30000,

  headers: {
    "Content-Type": "application/json",

    ...(PAYSTACK_SECRET_KEY
      ? {
          Authorization:
            `Bearer ${PAYSTACK_SECRET_KEY}`,
        }
      : {}),
  },
});

/* =========================================================
   INITIALIZE TRANSACTION
========================================================= */

export const initializePaystackTransaction =
  async ({
    email,
    amount,
    reference,
    metadata = {},
    callback_url,
  }) => {
    if (!PAYSTACK_SECRET_KEY) {
      throw new Error(
        "PAYSTACK_SECRET_KEY is not configured."
      );
    }

    if (!email) {
      throw new Error(
        "Paystack email is required."
      );
    }

    if (
      amount === undefined ||
      amount === null ||
      Number(amount) <= 0
    ) {
      throw new Error(
        "Paystack amount must be greater than zero."
      );
    }

    if (!reference) {
      throw new Error(
        "Paystack transaction reference is required."
      );
    }

    /* -------------------------------------------------------
       PAYSTACK REQUEST
    ------------------------------------------------------- */

    const payload = {
      email,

      /*
       * Paystack expects the amount in the currency
       * subunit.
       *
       * Example:
       * ₦5,000 = 500000 kobo
       */
      amount: String(
        Math.round(Number(amount))
      ),

      reference,

      metadata,

      ...(callback_url
        ? {
            callback_url,
          }
        : {}),
    };

    try {
      const response =
        await paystack.post(
          "/transaction/initialize",
          payload
        );

      return response.data;
    } catch (error) {
      console.error(
        "❌ PAYSTACK INITIALIZATION ERROR"
      );

      console.error(
        error?.response?.data ||
          error?.message ||
          error
      );

      throw error;
    }
  };

/* =========================================================
   VERIFY TRANSACTION
========================================================= */

export const verifyPaystackTransaction =
  async (reference) => {
    if (!PAYSTACK_SECRET_KEY) {
      throw new Error(
        "PAYSTACK_SECRET_KEY is not configured."
      );
    }

    if (!reference) {
      throw new Error(
        "Payment reference is required."
      );
    }

    try {
      const response =
        await paystack.get(
          `/transaction/verify/${encodeURIComponent(
            reference
          )}`
        );

      return response.data;
    } catch (error) {
      console.error(
        "❌ PAYSTACK VERIFICATION ERROR"
      );

      console.error(
        error?.response?.data ||
          error?.message ||
          error
      );

      throw error;
    }
  };

/* =========================================================
   OPTIONAL: GET TRANSACTION
========================================================= */

export const getPaystackTransaction =
  async (transactionId) => {
    if (!PAYSTACK_SECRET_KEY) {
      throw new Error(
        "PAYSTACK_SECRET_KEY is not configured."
      );
    }

    if (!transactionId) {
      throw new Error(
        "Transaction ID is required."
      );
    }

    try {
      const response =
        await paystack.get(
          `/transaction/${encodeURIComponent(
            transactionId
          )}`
        );

      return response.data;
    } catch (error) {
      console.error(
        "❌ PAYSTACK TRANSACTION ERROR"
      );

      console.error(
        error?.response?.data ||
          error?.message ||
          error
      );

      throw error;
    }
  };

/* =========================================================
   GET TRANSACTION TIMELINE
========================================================= */

export const getPaystackTransactionTimeline =
  async (reference) => {
    if (!PAYSTACK_SECRET_KEY) {
      throw new Error(
        "PAYSTACK_SECRET_KEY is not configured."
      );
    }

    if (!reference) {
      throw new Error(
        "Payment reference is required."
      );
    }

    try {
      const response =
        await paystack.get(
          `/transaction/timeline/${encodeURIComponent(
            reference
          )}`
        );

      return response.data;
    } catch (error) {
      console.error(
        "❌ PAYSTACK TIMELINE ERROR"
      );

      console.error(
        error?.response?.data ||
          error?.message ||
          error
      );

      throw error;
    }
  };

/* =========================================================
   EXPORT CLIENT
========================================================= */

export default paystack;