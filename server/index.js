const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { Resend } = require("resend");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const resend = new Resend(process.env.RESEND_API_KEY);

/* =========================
   MIDDLEWARE
========================= */
app.use(cors({
  origin: "*",
}));

app.use(express.json());

/* =========================
   HEALTH CHECK
========================= */
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "🚀 Scholiqen AI Backend Running",
  });
});

/* =========================
   CONTACT → ADMIN EMAIL
========================= */
app.post("/notify-admin", async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Missing fields",
      });
    }

    const data = await resend.emails.send({
      from: "Scholiqen System <onboarding@resend.dev>",
      to: ["scholiqen@gmail.com"],
      subject: "📥 New Contact Message Received",
      html: `
        <div style="font-family:Arial;padding:15px">
          <h2>📩 New Message</h2>
          <p><b>Name:</b> ${name}</p>
          <p><b>Email:</b> ${email}</p>
          <hr/>
          <p><b>Message:</b></p>
          <p>${message}</p>
          <hr/>
          <small>Scholiqen AI System</small>
        </div>
      `,
    });

    return res.json({
      success: true,
      message: "Email sent successfully",
      data,
    });

  } catch (err) {
    console.error("ADMIN EMAIL ERROR:", err);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

/* =========================
   AUTO REPLY USER
========================= */
app.post("/auto-reply", async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email || !name) {
      return res.status(400).json({
        success: false,
        message: "Missing email or name",
      });
    }

    await resend.emails.send({
      from: "Scholiqen Support <onboarding@resend.dev>",
      to: email,
      subject: "✔ We received your message",
      html: `
        <div style="font-family:Arial;padding:15px">
          <h3>Hello ${name},</h3>
          <p>We received your message and will respond shortly.</p>
          <br/>
          <p>— Scholiqen AI System</p>
        </div>
      `,
    });

    return res.json({
      success: true,
      message: "Auto-reply sent",
    });

  } catch (err) {
    console.error("AUTO REPLY ERROR:", err);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

/* =========================
   🤖 AI TUTOR (SMART VERSION v1)
========================= */
app.post("/ai-tutor", async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({
        success: false,
        message: "Question is required",
      });
    }

    const q = question.toLowerCase();

    let answer = "";

    // 🧠 SMART RULE-BASED AI (upgrade later to GPT)
    if (q.includes("math")) {
      answer =
        "📘 Math Tutor: Break problems into steps. Identify known values first, then solve carefully.";
    } else if (q.includes("biology")) {
      answer =
        "🧬 Biology Tutor: Focus on understanding processes like respiration, photosynthesis, and cell function.";
    } else if (q.includes("english")) {
      answer =
        "📖 English Tutor: Improve by reading daily and practicing writing short essays.";
    } else if (q.includes("exam")) {
      answer =
        "📝 Exam Tip: Practice past questions and manage your time strictly during revision.";
    } else {
      answer =
        "🤖 AI Tutor: I understand your question. Try breaking it into smaller parts for better understanding.";
    }

    return res.json({
      success: true,
      answer,
    });

  } catch (err) {
    console.error("AI TUTOR ERROR:", err);

    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

/* =========================
   START SERVER
========================= */
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});