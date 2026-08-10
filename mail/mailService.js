import nodemailer from "nodemailer";

const requiredEnv = [
  "MAIL_HOST",
  "MAIL_PORT",
  "MAIL_USER",
  "MAIL_PASSWORD",
  "MAIL_FROM",
];

for (const key of requiredEnv) {
  if (!process.env[key]) {
    console.warn(`⚠️ ${key} is missing from .env`);
  }
}

/* =========================================================
   MAIL TRANSPORTER
========================================================= */

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT || 587),
  secure: String(process.env.MAIL_SECURE) === "true",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD,
  },
});

/* =========================================================
   VERIFY MAIL CONNECTION
========================================================= */

export const verifyMailConnection = async () => {
  try {
    await transporter.verify();

    console.log("✅ Scholiqen mail system connected");
    return true;
  } catch (error) {
    console.error(
      "❌ Scholiqen mail system connection failed:",
      error.message
    );

    return false;
  }
};

/* =========================================================
   GENERAL SEND MAIL
========================================================= */

export const sendMail = async ({
  to,
  subject,
  html,
  text = "",
  replyTo = undefined,
}) => {
  if (!to) {
    throw new Error("Mail recipient is required.");
  }

  if (!subject) {
    throw new Error("Mail subject is required.");
  }

  if (!html && !text) {
    throw new Error("Mail content is required.");
  }

  const mailOptions = {
    from: process.env.MAIL_FROM || process.env.MAIL_USER,
    to,
    subject,
    text,
    html,
  };

  if (replyTo) {
    mailOptions.replyTo = replyTo;
  }

  const info = await transporter.sendMail(mailOptions);

  console.log("📧 Email sent:", {
    messageId: info.messageId,
    to,
    subject,
  });

  return info;
};

/* =========================================================
   SEND HTML MAIL
========================================================= */

export const sendHtmlMail = async ({
  to,
  subject,
  html,
  text = "",
  replyTo,
}) => {
  return sendMail({
    to,
    subject,
    html,
    text,
    replyTo,
  });
};

export default transporter;