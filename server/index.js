const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { Resend } = require("resend");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const resend = new Resend(process.env.RESEND_API_KEY);

app.use(cors({ origin: "*" }));
app.use(express.json());

/* =========================
   🤖 AI TUTOR (STREAMING)
========================= */
app.post("/ai-tutor", async (req, res) => {
  const { question } = req.body;

  // Set headers for raw text stream
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Transfer-Encoding", "chunked");

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // Use the streaming version
    const result = await model.generateContentStream(question);

    // Stream chunks directly
    for await (const chunk of result.stream) {
      res.write(chunk.text());
    }
    res.end();
  } catch (err) {
    console.error("AI Error:", err);
    res.write("⚠️ Error: Could not connect to AI server.");
    res.end();
  }
});

/* =========================
   CONTACT EMAIL (KEPT)
========================= */
app.post("/notify-admin", async (req, res) => {
  try {
    const { name, email, message } = req.body;
    await resend.emails.send({
      from: "AI System <onboarding@resend.dev>",
      to: ["scholiqen@gmail.com"],
      subject: "New Contact Message",
      html: `<p>Name: ${name}</p><p>Email: ${email}</p><p>Message: ${message}</p>`,
    });
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));