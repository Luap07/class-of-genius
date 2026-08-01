import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Groq from "groq-sdk";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

if (!process.env.GROQ_API_KEY) {
  console.error("❌ GROQ_API_KEY is missing in .env");
  process.exit(1);
}

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/* ------------------------------------------------------- */
/* HEALTH                                                  */
/* ------------------------------------------------------- */

app.get("/", (req, res) => {
  res.json({
    status: "running",
    name: "Scholiqen AI",
  });
});

/* ------------------------------------------------------- */
/* GENERAL AI + LANGUAGE AI                               */
/* ------------------------------------------------------- */

app.post("/api/tutor", async (req, res) => {
  try {
    const {
      message,

      /* General Tutor */
      subject = "General",
      classLevel = "WAEC",

      /* Language Tutor */
      language = "English",
      nativeName = "",
      lesson = "",
      section = "Overview",

      mode = "general",
    } = req.body;

    if (!message) {
      return res.status(400).json({
        reply: "Message is required.",
      });
    }

    let systemPrompt = "";

    /* ------------------------------------------------------- */
    /* LANGUAGE MODE                                           */
    /* ------------------------------------------------------- */

    if (mode === "language") {
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

• Be encouraging.

Reply in ${language} unless the user requests English.

If mathematics appears,
use valid LaTeX.
`;
    }

    /* ------------------------------------------------------- */
    /* GENERAL MODE                                            */
    /* ------------------------------------------------------- */

    else {
      systemPrompt = `
You are ScholiqenAI.

Subject:
${subject}

Class:
${classLevel}

Language:
${language}

Teach like ChatGPT.

Explain clearly.

Give examples.

Use markdown.

If mathematics appears:

Use valid LaTeX.

Show every step.
`;
    }

    const completion =
      await groq.chat.completions.create({

        model: "llama-3.1-8b-instant",

        temperature: 0.6,

        max_tokens: 2048,

        messages: [

          {
            role: "system",
            content: systemPrompt,
          },

          {
            role: "user",
            content: message,
          },

        ],

      });

    const reply =
      completion.choices?.[0]?.message?.content ||
      "I couldn't generate a response.";

    return res.json({
      reply,
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      reply:
        "AI is temporarily unavailable.",
    });
  }
});

/* ------------------------------------------------------- */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Scholiqen AI running on port ${PORT}`);
});