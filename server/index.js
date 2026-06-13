const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { Resend } = require("resend");

dotenv.config();

const app = express();
const resend = new Resend(process.env.RESEND_API_KEY);

app.use(cors());
app.use(express.json());

/* =========================
   NOTIFY ADMIN (GMAIL ALERT)
========================= */
app.post("/notify-admin", async (req, res) => {
  try {
    const { name, email, message } = req.body;

    await resend.emails.send({
      from: "Alert System <onboarding@resend.dev>",
      to: "scholiqen@gmail.com", // 👈 PUT YOUR EMAIL HERE
      subject: "📥 New Contact Message",
      html: `
        <h2>New Message Received 🚀</h2>
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Message:</b></p>
        <p>${message}</p>
      `,
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(5000, () => {
  console.log("🚀 Server running on http://localhost:5000");
});