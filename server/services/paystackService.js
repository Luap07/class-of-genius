import axios from "axios";

const PAYSTACK_SECRET_KEY =
  process.env.PAYSTACK_SECRET_KEY?.trim();

const paystack = axios.create({
  baseURL: "https://api.paystack.co",
  headers: {
    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
    "Content-Type": "application/json",
  },
});

export const initializePaystackTransaction = async ({
  email,
  amount,
  reference,
  metadata,
  callback_url,
}) => {
  const response = await paystack.post(
    "/transaction/initialize",
    {
      email,
      amount,
      reference,
      metadata,
      callback_url,
    }
  );

  return response.data;
};

export const verifyPaystackTransaction = async (
  reference
) => {
  const response = await paystack.get(
    `/transaction/verify/${encodeURIComponent(reference)}`
  );

  return response.data;
};