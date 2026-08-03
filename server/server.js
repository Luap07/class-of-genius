import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());


/* ------------------------------------------------------- */
/* OPENAI SETUP                                            */
/* ------------------------------------------------------- */

if (!process.env.OPENAI_API_KEY) {
  console.error("❌ OPENAI_API_KEY is missing in .env");
  process.exit(1);
}


const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
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
/* AI TUTOR + LANGUAGE AI                                  */
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

• Encourage students.


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

        model: "gpt-4o-mini",

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



  } catch (error) {


    console.error("Tutor Error:", error);



    return res.status(500).json({

      reply: "AI is temporarily unavailable.",

    });


  }

});



/* ------------------------------------------------------- */
/* OPENAI TEXT TO SPEECH                                   */
/* ------------------------------------------------------- */

app.post("/api/pronounce", async (req, res) => {


  try {


    const {

      text,

      language = "Arabic",

    } = req.body;



    if (!text) {


      return res.status(400).json({

        error: "Text is required",

      });


    }



    const speech =
      await openai.audio.speech.create({

        model: "gpt-4o-mini-tts",

        voice: "alloy",

        input: text,


        instructions:

        `Pronounce this ${language} text clearly and naturally.`

      });



    const buffer =
      Buffer.from(await speech.arrayBuffer());



    res.setHeader(
      "Content-Type",
      "audio/mpeg"
    );


    res.send(buffer);



  } catch (error) {


    console.error(
      "TTS Error:",
      error
    );



    res.status(500).json({

      error: "Failed to generate speech",

    });


  }


});



/* ------------------------------------------------------- */
/* SERVER START                                           */
/* ------------------------------------------------------- */


const PORT =
  process.env.PORT || 5000;



app.listen(PORT, () => {

  console.log(
    `🚀 Scholiqen AI running on port ${PORT}`
  );

});