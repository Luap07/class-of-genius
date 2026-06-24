import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Groq from "groq-sdk";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// ================= CHECK KEY =================
if (!process.env.GROQ_API_KEY) {
  console.log("❌ GROQ_API_KEY missing in .env file");
}

// ================= INIT GROQ =================
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// ================= AI ROUTE =================
app.post("/api/tutor", async (req, res) => {
  try {
    const {
      message,
      subject = "General",
      classLevel = "WAEC",
      language = "English",
    } = req.body;

    if (!message) {
      return res.status(400).json({
        reply: "Message is required",
      });
    }

    const prompt = `
You are ScholiqenAI, an intelligent AI tutor similar to ChatGPT.

STUDENT INFO:
- Subject: ${subject}
- Class Level: ${classLevel}
- Language: ${language}

LANGUAGE RULES:
- Reply ONLY in ${language}.
- Never switch languages unless asked.
- Keep explanations natural and student-friendly.

TUTOR RULES:
- Teach like a real teacher.
- Explain concepts simply.
- Give examples when useful.
- Break difficult topics into steps.
- Be conversational, not robotic.

IMPORTANT MATH RULES:
- ALL mathematics must be written in LaTeX format.
- Never use plain text powers like x^2.
- Use proper superscripts.

Examples:

x²:
$$x^2$$

3x²:
$$3x^2$$

(x + 1)²:
$$(x+1)^2$$

Square root:
$$\\sqrt{25}$$

Cube root:
$$\\sqrt[3]{27}$$

Fraction:
$$\\frac{3}{4}$$

Equation:
$$2x+5=15$$

Quadratic:
$$x^2+5x+6=0$$

- Always use \\frac for fractions.
- Always use superscripts for powers.
- Always use \\sqrt for roots.
- Show calculations step-by-step.
- Put important formulas inside LaTeX blocks.
- Simplify answers where possible.

BEHAVIOR:
- Friendly
- Encouraging
- Clear
- Educational
- Similar to ChatGPT

QUESTION:
${message}
`;

    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",

      messages: [
        {
          role: "system",
          content: `
You are EduAI.

Always teach clearly.

For mathematics:
- Output valid LaTeX.
- Use \\frac for fractions.
- Use x^2 instead of x² in raw output.
- Use \\sqrt{} for roots.
- Show step-by-step solutions.
- Keep formatting compatible with KaTeX/MathJax rendering.
`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],

      temperature: 0.6,
      max_tokens: 2048,
    });

    const reply =
      response.choices?.[0]?.message?.content ||
      "Sorry, I couldn't generate a response.";

    return res.json({ reply });
  } catch (error) {
    console.error("AI ERROR:", error);

    return res.status(500).json({
      reply: "AI is temporarily unavailable. Try again later.",
    });
  }
});

// ================= START SERVER =================
app.listen(5000, () => {
  console.log("🚀 Server running on port 5000");
});