import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Resend } from "resend";

// ============================================================
// SERVER DIRECTORY
// ============================================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// All API keys are inside:
// C:\Users\DELL\cog\server\.env

const envPath = path.resolve(__dirname, ".env");

dotenv.config({
  path: envPath,
});

// ============================================================
// ENVIRONMENT CHECK
// ============================================================

console.log("========================================");
console.log("SCHOLIQEN SERVER");
console.log("========================================");
console.log("ENV FILE:", envPath);
console.log("RESEND:", Boolean(process.env.RESEND_API_KEY));
console.log("GEMINI:", Boolean(process.env.GEMINI_API_KEY));
console.log("GNEWS:", Boolean(process.env.GNEWS_API_KEY));
console.log("========================================");

// ============================================================
// APP
// ============================================================

const app = express();

const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: "*",
  })
);

app.use(express.json());

// ============================================================
// API CLIENTS
// ============================================================

// Gemini
const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

// Resend
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

// ============================================================
// HEALTH CHECK
// ============================================================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Scholiqen API server is running 🚀",
    services: {
      gemini: Boolean(process.env.GEMINI_API_KEY),
      resend: Boolean(process.env.RESEND_API_KEY),
      gnews: Boolean(process.env.GNEWS_API_KEY),
    },
  });
});

// ============================================================
// 🤖 AI TUTOR
// ============================================================

app.post("/ai-tutor", async (req, res) => {
  const { question } = req.body;

  if (!question || !question.trim()) {
    return res.status(400).json({
      error: "Question is required.",
    });
  }

  if (!genAI) {
    return res.status(500).json({
      error: "Gemini API key is not configured.",
    });
  }

  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Transfer-Encoding", "chunked");

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    const result = await model.generateContentStream(question);

    for await (const chunk of result.stream) {
      const text = chunk.text();

      if (text) {
        res.write(text);
      }
    }

    res.end();
  } catch (error) {
    console.error("AI Tutor Error:", error);

    if (!res.headersSent) {
      return res.status(500).json({
        error: "Could not connect to AI server.",
      });
    }

    res.write("\n⚠️ Error: Could not connect to AI server.");
    res.end();
  }
});

// ============================================================
// 📰 SCHOOL NEWS
// ============================================================
//
// GET /news/school
//
// Optional country:
//
// /news/school?country=ng
// /news/school?country=us
// /news/school?country=gb
//
// GNews API key remains on the server.
// ============================================================

app.get("/news/school", async (req, res) => {
  try {
    const apiKey = process.env.GNEWS_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "GNews API key is not configured.",
      });
    }

    const country = req.query.country || "";

    const searchQuery =
      "school education students teachers learning university education";

    const params = new URLSearchParams({
      q: searchQuery,
      lang: "en",
      max: "10",
      sortby: "publishedAt",
      apikey: apiKey,
    });

    if (country) {
      params.set("country", country);
    }

    const response = await fetch(
      `https://gnews.io/api/v4/search?${params.toString()}`
    );

    if (!response.ok) {
      const errorText = await response.text();

      console.error("GNews School Error:", errorText);

      return res.status(response.status).json({
        error: "Unable to fetch school news.",
      });
    }

    const data = await response.json();

    const articles = (data.articles || []).map((article) => ({
      title: article.title,
      description: article.description,
      content: article.content,
      url: article.url,
      image: article.image,
      publishedAt: article.publishedAt,
      source: article.source?.name || "Unknown source",
    }));

    return res.json({
      success: true,
      totalArticles: articles.length,
      articles,
    });
  } catch (error) {
    console.error("School News Error:", error);

    return res.status(500).json({
      error: "Failed to fetch school news.",
    });
  }
});

// ============================================================
// 🌍 GLOBAL EDUCATION NEWS
// ============================================================
//
// GET /news/education
//
// Fetches current education-related news from GNews.
// ============================================================

app.get("/news/education", async (req, res) => {
  try {
    const apiKey = process.env.GNEWS_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "GNews API key is not configured.",
      });
    }

    const params = new URLSearchParams({
      q: "education schools students teachers universities learning",
      lang: "en",
      max: "20",
      sortby: "publishedAt",
      apikey: apiKey,
    });

    const response = await fetch(
      `https://gnews.io/api/v4/search?${params.toString()}`
    );

    if (!response.ok) {
      const errorText = await response.text();

      console.error("GNews Education Error:", errorText);

      return res.status(response.status).json({
        error: "Unable to fetch education news.",
      });
    }

    const data = await response.json();

    const articles = (data.articles || []).map((article) => ({
      title: article.title,
      description: article.description,
      content: article.content,
      url: article.url,
      image: article.image,
      publishedAt: article.publishedAt,
      source: article.source?.name || "Unknown source",
    }));

    return res.json({
      success: true,
      totalArticles: articles.length,
      articles,
    });
  } catch (error) {
    console.error("Education News Error:", error);

    return res.status(500).json({
      error: "Failed to fetch education news.",
    });
  }
});

// ============================================================
// 📧 CONTACT / ADMIN EMAIL
// ============================================================

app.post("/notify-admin", async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        error: "Name, email and message are required.",
      });
    }

    if (!resend) {
      return res.status(500).json({
        error: "Resend API key is not configured.",
      });
    }

    const result = await resend.emails.send({
      from: "Scholiqen <onboarding@resend.dev>",
      to: ["scholiqen@gmail.com"],
      subject: "New Contact Message",
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>New Contact Message</h2>

          <p>
            <strong>Name:</strong>
            ${name}
          </p>

          <p>
            <strong>Email:</strong>
            ${email}
          </p>

          <p>
            <strong>Message:</strong>
            ${message}
          </p>
        </div>
      `,
    });

    return res.json({
      success: true,
      message: "Message sent successfully.",
      data: result,
    });
  } catch (error) {
    console.error("Resend Error:", error);

    return res.status(500).json({
      error: error.message || "Failed to send email.",
    });
  }
});

// ============================================================
// 404
// ============================================================

app.use((req, res) => {
  res.status(404).json({
    error: "API route not found.",
    path: req.originalUrl,
  });
});

// ============================================================
// START SERVER
// ============================================================

app.listen(PORT, () => {
  console.log("");
  console.log("🚀 Scholiqen API server started");
  console.log(`📡 http://localhost:${PORT}`);
  console.log(`📰 School News: http://localhost:${PORT}/news/school`);
  console.log(`🌍 Education News: http://localhost:${PORT}/news/education`);
  console.log(`🤖 AI Tutor: http://localhost:${PORT}/ai-tutor`);
  console.log("");
});

