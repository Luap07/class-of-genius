import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import { Resend } from "resend";

dotenv.config();

const app = express();

/* =========================================================
   MIDDLEWARE
========================================================= */

app.use(
  cors({
    origin: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "2mb" }));

/* =========================================================
   OPENAI SETUP
========================================================= */

if (!process.env.OPENAI_API_KEY) {
  console.error("❌ OPENAI_API_KEY is missing in .env");
  process.exit(1);
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/* =========================================================
   RESEND SETUP
========================================================= */

if (!process.env.RESEND_API_KEY) {
  console.warn(
    "⚠️ RESEND_API_KEY is missing. Email sending is disabled."
  );
}

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

/*
  CONTACT_EMAIL is the email address that receives
  messages from the website contact form.

  Example .env:

  CONTACT_EMAIL=scholiqen@gmail.com
*/

const contactEmail =
  process.env.CONTACT_EMAIL ||
  "scholiqen@gmail.com";

/*
  Instructor application recipient.
*/

const instructorApplicationEmail =
  process.env.INSTRUCTOR_APPLICATION_EMAIL;

const resendFromEmail =
  process.env.RESEND_FROM_EMAIL ||
  "Scholiqen <onboarding@resend.dev>";

/* =========================================================
   HEALTH CHECK
========================================================= */

app.get("/", (req, res) => {
  res.json({
    status: "running",
    name: "Scholiqen AI",

    contactForm: Boolean(resend && contactEmail),

    instructorApplications: Boolean(
      resend && instructorApplicationEmail
    ),
  });
});

/* =========================================================
   CONTACT FORM
   POST /notify-admin
========================================================= */

app.post("/notify-admin", async (req, res) => {
  try {
    console.log("📩 Contact message received");

    /* -----------------------------------------------------
       EMAIL SERVICE CHECK
    ----------------------------------------------------- */

    if (!resend) {
      return res.status(500).json({
        success: false,
        error:
          "Email service is not configured. RESEND_API_KEY is missing.",
      });
    }

    if (!contactEmail) {
      return res.status(500).json({
        success: false,
        error:
          "CONTACT_EMAIL is missing from .env",
      });
    }

    /* -----------------------------------------------------
       FORM DATA
    ----------------------------------------------------- */

    const {
      name,
      email,
      message,
    } = req.body;

    /* -----------------------------------------------------
       REQUIRED FIELDS
    ----------------------------------------------------- */

    if (
      !name ||
      !email ||
      !message
    ) {
      return res.status(400).json({
        success: false,
        error:
          "Name, email and message are required.",
      });
    }

    /* -----------------------------------------------------
       CLEAN DATA
    ----------------------------------------------------- */

    const cleanName =
      String(name).trim();

    const cleanEmail =
      String(email).trim();

    const cleanMessage =
      String(message).trim();

    /* -----------------------------------------------------
       EMAIL VALIDATION
    ----------------------------------------------------- */

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        error:
          "Please provide a valid email address.",
      });
    }

    /* =====================================================
       EMAIL HTML
    ===================================================== */

    const emailHtml = `
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8" />

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  />

  <title>New Scholiqen Contact Message</title>

  <style>

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      padding: 0;

      background: #020617;

      color: #e2e8f0;

      font-family:
        Arial,
        Helvetica,
        sans-serif;
    }

    .wrapper {
      width: 100%;

      padding: 40px 16px;

      background: #020617;
    }

    .container {
      width: 100%;

      max-width: 700px;

      margin: 0 auto;

      overflow: hidden;

      background: #0f172a;

      border:
        1px solid
        #1e293b;

      border-radius: 26px;
    }

    .header {
      padding: 34px;

      background:
        linear-gradient(
          135deg,
          #0f172a 0%,
          #172554 55%,
          #0c4a6e 100%
        );

      border-bottom:
        1px solid
        #1e293b;
    }

    .brand {
      color: #ffffff;

      font-size: 28px;

      font-weight: 900;

      letter-spacing: -0.5px;
    }

    .brand span {
      color: #22d3ee;
    }

    .badge {
      display: inline-block;

      margin-top: 16px;

      padding:
        8px
        13px;

      border-radius: 999px;

      background:
        rgba(
          34,
          211,
          238,
          0.10
        );

      border:
        1px solid
        rgba(
          34,
          211,
          238,
          0.20
        );

      color: #22d3ee;

      font-size: 11px;

      font-weight: 800;

      text-transform: uppercase;

      letter-spacing: 1.5px;
    }

    .content {
      padding: 34px;
    }

    .title {
      margin: 0;

      color: #ffffff;

      font-size: 28px;

      line-height: 1.25;

      font-weight: 900;
    }

    .intro {
      margin-top: 12px;

      color: #94a3b8;

      font-size: 15px;

      line-height: 1.8;
    }

    .section-title {
      margin:
        30px
        0
        14px;

      color: #38bdf8;

      font-size: 16px;

      font-weight: 800;
    }

    .field {
      padding: 18px;

      background: #020617;

      border:
        1px solid
        #1e293b;

      border-radius: 16px;

      margin-bottom: 12px;
    }

    .label {
      margin-bottom: 8px;

      color: #64748b;

      font-size: 10px;

      font-weight: 800;

      text-transform: uppercase;

      letter-spacing: 1px;
    }

    .value {
      color: #f8fafc;

      font-size: 14px;

      line-height: 1.7;

      word-break: break-word;
    }

    .message {
      padding: 20px;

      background: #020617;

      border:
        1px solid
        #1e293b;

      border-radius: 16px;

      color: #cbd5e1;

      font-size: 15px;

      line-height: 1.8;

      white-space: pre-wrap;

      word-break: break-word;
    }

    .reply {
      display: inline-block;

      margin-top: 22px;

      padding:
        12px
        18px;

      border-radius: 12px;

      background: #0891b2;

      color: #ffffff;

      text-decoration: none;

      font-size: 13px;

      font-weight: 800;
    }

    .footer {
      padding:
        24px
        34px;

      border-top:
        1px solid
        #1e293b;

      color: #64748b;

      font-size: 12px;

      line-height: 1.7;
    }

    @media (max-width: 600px) {

      .wrapper {
        padding:
          15px
          8px;
      }

      .header,
      .content {
        padding: 24px;
      }

      .title {
        font-size: 24px;
      }

    }

  </style>

</head>

<body>

  <div class="wrapper">

    <div class="container">

      <!-- HEADER -->

      <div class="header">

        <div class="brand">
          Scholiqen
          <span>•</span>
          Contact
        </div>

        <div class="badge">
          New Website Message
        </div>

      </div>

      <!-- CONTENT -->

      <div class="content">

        <h1 class="title">
          You have a new message
        </h1>

        <p class="intro">
          Someone has contacted Scholiqen
          through the website contact form.
        </p>

        <!-- SENDER -->

        <h2 class="section-title">
          Sender Information
        </h2>

        <div class="field">

          <div class="label">
            Name
          </div>

          <div class="value">
            ${escapeHtml(cleanName)}
          </div>

        </div>

        <div class="field">

          <div class="label">
            Email Address
          </div>

          <div class="value">
            ${escapeHtml(cleanEmail)}
          </div>

        </div>

        <!-- MESSAGE -->

        <h2 class="section-title">
          Message
        </h2>

        <div class="message">
          ${escapeHtml(cleanMessage)}
        </div>

        <a
          href="mailto:${escapeHtml(cleanEmail)}"
          class="reply"
        >
          Reply to ${escapeHtml(cleanName)}
        </a>

      </div>

      <!-- FOOTER -->

      <div class="footer">

        This message was submitted through
        the official Scholiqen website.

        <br />

        Sender:
        ${escapeHtml(cleanEmail)}

      </div>

    </div>

  </div>

</body>

</html>
`;

    /* =====================================================
       SEND EMAIL
    ===================================================== */

    const {
      data,
      error,
    } = await resend.emails.send({

      from: resendFromEmail,

      to: [
        contactEmail,
      ],

      replyTo: cleanEmail,

      subject:
        `New Scholiqen Contact Message — ${cleanName}`,

      html: emailHtml,
    });

    /* -----------------------------------------------------
       RESEND ERROR
    ----------------------------------------------------- */

    if (error) {

      console.error(
        "❌ Resend contact email error:",
        error
      );

      return res.status(500).json({
        success: false,

        error:
          "Failed to send your message.",

        details:
          error?.message ||
          String(error),
      });
    }

    /* -----------------------------------------------------
       SUCCESS
    ----------------------------------------------------- */

    console.log(
      "✅ Contact email sent:",
      data?.id
    );

    return res.status(200).json({

      success: true,

      message:
        "Your message has been sent successfully.",

      emailId:
        data?.id || null,
    });

  } catch (error) {

    console.error(
      "❌ Contact route error:",
      error
    );

    return res.status(500).json({

      success: false,

      error:
        "Something went wrong while sending your message.",

      details:
        process.env.NODE_ENV === "development"
          ? error?.message
          : undefined,
    });
  }
});

/* =========================================================
   INSTRUCTOR APPLICATION
========================================================= */

app.post(
  "/instructor-application",
  async (req, res) => {

    try {

      console.log(
        "📩 Instructor application received"
      );

      if (!resend) {

        return res.status(500).json({
          success: false,
          error:
            "Email service is not configured. RESEND_API_KEY is missing.",
        });

      }

      if (!instructorApplicationEmail) {

        return res.status(500).json({
          success: false,
          error:
            "INSTRUCTOR_APPLICATION_EMAIL is missing from .env",
        });

      }

      const {
        fullName,
        email,
        phone,
        countryCode,
        country,

        expertise,
        experience,
        education,
        occupation,

        courseTitle,
        courseLevel,
        courseDescription,

        website,
        linkedin,
        youtube,

        teachingExperience,
        availability,

        instructorAgreement,
        originalContent,
        qualityStandards,
        terms,
      } = req.body;

      const requiredFields = {
        fullName,
        email,
        phone,
        country,
        expertise,
        experience,
        education,
        occupation,
        courseTitle,
        courseLevel,
        courseDescription,
        teachingExperience,
        availability,
      };

      const missingFields =
        Object.entries(requiredFields)
          .filter(
            ([, value]) =>
              value === undefined ||
              value === null ||
              String(value).trim() === ""
          )
          .map(
            ([key]) => key
          );

      if (
        missingFields.length > 0
      ) {

        return res.status(400).json({

          success: false,

          error:
            "Please complete all required fields.",

          missingFields,
        });
      }

      const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (
        !emailPattern.test(email)
      ) {

        return res.status(400).json({

          success: false,

          error:
            "Please provide a valid email address.",
        });
      }

      if (
        instructorAgreement !== true ||
        originalContent !== true ||
        qualityStandards !== true ||
        terms !== true
      ) {

        return res.status(400).json({

          success: false,

          error:
            "All instructor agreements must be accepted.",
        });
      }

      const completePhone =
        `${countryCode || ""} ${phone}`.trim();

      const emailHtml = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<style>

body {
  margin: 0;
  padding: 0;
  background: #020617;
  color: #e2e8f0;
  font-family: Arial, Helvetica, sans-serif;
}

.wrapper {
  width: 100%;
  padding: 40px 16px;
  background: #020617;
}

.container {
  max-width: 760px;
  margin: auto;
  background: #0f172a;
  border: 1px solid #1e293b;
  border-radius: 24px;
  overflow: hidden;
}

.header {
  padding: 32px;
  background: linear-gradient(
    135deg,
    #0f172a,
    #172554,
    #0c4a6e
  );
}

.brand {
  font-size: 28px;
  font-weight: 900;
  color: white;
}

.brand span {
  color: #22d3ee;
}

.content {
  padding: 32px;
}

.title {
  color: white;
  font-size: 28px;
  font-weight: 900;
}

.section {
  margin-top: 28px;
}

.section h2 {
  color: #38bdf8;
  font-size: 17px;
}

.field {
  margin-top: 10px;
  padding: 16px;
  background: #020617;
  border: 1px solid #1e293b;
  border-radius: 14px;
}

.label {
  color: #64748b;
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
}

.value {
  margin-top: 6px;
  color: #f8fafc;
  font-size: 14px;
  line-height: 1.7;
}

.footer {
  padding: 24px 32px;
  border-top: 1px solid #1e293b;
  color: #64748b;
  font-size: 12px;
}

</style>

</head>

<body>

<div class="wrapper">

<div class="container">

<div class="header">

<div class="brand">
Scholiqen
<span>•</span>
Instructor Program
</div>

</div>

<div class="content">

<h1 class="title">
New Instructor Application
</h1>

<div class="section">

<h2>Personal Information</h2>

<div class="field">
<div class="label">Full Name</div>
<div class="value">
${escapeHtml(fullName)}
</div>
</div>

<div class="field">
<div class="label">Email</div>
<div class="value">
${escapeHtml(email)}
</div>
</div>

<div class="field">
<div class="label">Phone</div>
<div class="value">
${escapeHtml(completePhone)}
</div>
</div>

<div class="field">
<div class="label">Country</div>
<div class="value">
${escapeHtml(country)}
</div>
</div>

</div>

<div class="section">

<h2>Professional Background</h2>

<div class="field">
<div class="label">Expertise</div>
<div class="value">
${escapeHtml(expertise)}
</div>
</div>

<div class="field">
<div class="label">Experience</div>
<div class="value">
${escapeHtml(experience)}
</div>
</div>

<div class="field">
<div class="label">Education</div>
<div class="value">
${escapeHtml(education)}
</div>
</div>

<div class="field">
<div class="label">Occupation</div>
<div class="value">
${escapeHtml(occupation)}
</div>
</div>

</div>

<div class="section">

<h2>Proposed Course</h2>

<div class="field">
<div class="label">Course Title</div>
<div class="value">
${escapeHtml(courseTitle)}
</div>
</div>

<div class="field">
<div class="label">Course Level</div>
<div class="value">
${escapeHtml(courseLevel)}
</div>
</div>

<div class="field">
<div class="label">Description</div>
<div class="value">
${escapeHtml(courseDescription)}
</div>
</div>

</div>

<div class="section">

<h2>Online Presence</h2>

<div class="field">
<div class="label">Website</div>
<div class="value">
${escapeHtml(
  website || "Not provided"
)}
</div>
</div>

<div class="field">
<div class="label">LinkedIn</div>
<div class="value">
${escapeHtml(
  linkedin || "Not provided"
)}
</div>
</div>

<div class="field">
<div class="label">YouTube</div>
<div class="value">
${escapeHtml(
  youtube || "Not provided"
)}
</div>
</div>

</div>

<div class="section">

<h2>Teaching</h2>

<div class="field">
<div class="label">Teaching Experience</div>
<div class="value">
${escapeHtml(teachingExperience)}
</div>
</div>

<div class="field">
<div class="label">Availability</div>
<div class="value">
${escapeHtml(availability)}
</div>
</div>

</div>

<div class="section">

<h2>Agreements</h2>

<div class="field">
<div class="value">
✓ All instructor agreements accepted
</div>
</div>

</div>

</div>

<div class="footer">

Scholiqen Instructor Program

<br>

Applicant:
${escapeHtml(email)}

</div>

</div>

</div>

</body>
</html>
`;

      const {
        data,
        error,
      } = await resend.emails.send({

        from: resendFromEmail,

        to: [
          instructorApplicationEmail,
        ],

        replyTo: email,

        subject:
          `New Instructor Application — ${fullName}`,

        html: emailHtml,
      });

      if (error) {

        console.error(
          "❌ Resend instructor application error:",
          error
        );

        return res.status(500).json({

          success: false,

          error:
            "Failed to send instructor application email.",

          details:
            error?.message ||
            String(error),
        });
      }

      console.log(
        "✅ Instructor application email sent:",
        data?.id
      );

      return res.status(200).json({

        success: true,

        message:
          "Instructor application submitted successfully.",

        emailId:
          data?.id || null,
      });

    } catch (error) {

      console.error(
        "❌ Instructor application route error:",
        error
      );

      return res.status(500).json({

        success: false,

        error:
          "Something went wrong while submitting the instructor application.",

        details:
          process.env.NODE_ENV === "development"
            ? error?.message
            : undefined,
      });
    }
  }
);

/* =========================================================
   AI TUTOR
========================================================= */

app.post(
  "/api/tutor",
  async (req, res) => {

    try {

      const {
        message,

        subject = "General",

        classLevel = "WAEC",

        language = "English",

        nativeName = "",

        lesson = "",

        section = "Overview",

        mode = "general",
      } = req.body;

      if (!message) {

        return res.status(400).json({
          reply:
            "Message is required.",
        });
      }

      let systemPrompt = "";

      if (
        mode === "language"
      ) {

        systemPrompt = `
You are Scholiqen Language AI.

You are an expert language teacher.

Language:
${language}

Native Name:
${nativeName}

Current Lesson:
${lesson}

Current Section:
${section}

Your responsibilities:

• Teach pronunciation.
• Teach grammar.
• Teach vocabulary.
• Explain alphabet.
• Help students practice speaking.
• Help students practice listening.
• Help students practice writing.
• Translate words.
• Correct grammar mistakes.
• Generate quizzes.
• Encourage students.

Reply in ${language} unless the user requests English.

If mathematics appears,
use valid LaTeX.
`;

      } else {

        systemPrompt = `
You are Scholiqen AI Tutor.

Subject:
${subject}

Class Level:
${classLevel}

Language:
${language}

Teach like an expert teacher.

Explain clearly.

Give examples.

Use markdown.

If mathematics appears:

Use valid LaTeX.

Show every step.
`;
      }

      const completion =
        await openai.chat.completions.create({

          model:
            "gpt-4o-mini",

          temperature: 0.6,

          max_tokens: 2048,

          messages: [

            {
              role: "system",
              content:
                systemPrompt,
            },

            {
              role: "user",
              content:
                message,
            },

          ],
        });

      const reply =
        completion
          .choices?.[0]
          ?.message
          ?.content ||
        "I couldn't generate a response.";

      return res.json({
        reply,
      });

    } catch (error) {

      console.error(
        "❌ Tutor Error:",
        error
      );

      return res.status(500).json({

        reply:
          "AI is temporarily unavailable.",
      });
    }
  }
);

/* =========================================================
   TEXT TO SPEECH
========================================================= */

app.post(
  "/api/pronounce",
  async (req, res) => {

    try {

      const {
        text,

        language = "Arabic",
      } = req.body;

      if (!text) {

        return res.status(400).json({
          error:
            "Text is required",
        });
      }

      const speech =
        await openai.audio.speech.create({

          model:
            "gpt-4o-mini-tts",

          voice:
            "alloy",

          input:
            text,

          instructions:
            `Pronounce this ${language} text clearly and naturally.`,
        });

      const buffer =
        Buffer.from(
          await speech.arrayBuffer()
        );

      res.setHeader(
        "Content-Type",
        "audio/mpeg"
      );

      return res.send(buffer);

    } catch (error) {

      console.error(
        "❌ TTS Error:",
        error
      );

      return res.status(500).json({

        error:
          "Failed to generate speech",
      });
    }
  }
);

/* =========================================================
   404
========================================================= */

app.use(
  (req, res) => {

    res.status(404).json({

      error:
        "API route not found.",

      path:
        req.originalUrl,
    });
  }
);

/* =========================================================
   GLOBAL ERROR HANDLER
========================================================= */

app.use(
  (
    error,
    req,
    res,
    next
  ) => {

    console.error(
      "❌ Unhandled server error:",
      error
    );

    res.status(500).json({

      error:
        "Internal server error.",
    });
  }
);

/* =========================================================
   SERVER START
========================================================= */

const PORT =
  process.env.PORT || 5000;

app.listen(
  PORT,
  () => {

    console.log("");

    console.log(
      "=============================================="
    );

    console.log(
      "🚀 SCHOLIQEN SERVER"
    );

    console.log(
      "=============================================="
    );

    console.log(
      `🌐 Port: ${PORT}`
    );

    console.log(
      `🤖 OpenAI: ${
        process.env.OPENAI_API_KEY
          ? "ENABLED"
          : "DISABLED"
      }`
    );

    console.log(
      `📩 Resend: ${
        resend
          ? "ENABLED"
          : "DISABLED"
      }`
    );

    console.log(
      `📧 Contact Email: ${
        contactEmail ||
        "NOT CONFIGURED"
      }`
    );

    console.log(
      `📨 Instructor Email: ${
        instructorApplicationEmail ||
        "NOT CONFIGURED"
      }`
    );

    console.log(
      `💬 Contact Form: ${
        resend && contactEmail
          ? "ENABLED"
          : "DISABLED"
      }`
    );

    console.log(
      `📝 Instructor Applications: ${
        resend &&
        instructorApplicationEmail
          ? "ENABLED"
          : "DISABLED"
      }`
    );

    console.log(
      "=============================================="
    );

    console.log("");
  }
);

/* =========================================================
   HTML ESCAPE
========================================================= */

function escapeHtml(value) {

  return String(
    value ?? ""
  )

    .replace(
      /&/g,
      "&amp;"
    )

    .replace(
      /</g,
      "&lt;"
    )

    .replace(
      />/g,
      "&gt;"
    )

    .replace(
      /"/g,
      "&quot;"
    )

    .replace(
      /'/g,
      "&#039;"
    );
}