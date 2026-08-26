import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get(
  "SUPABASE_SERVICE_ROLE_KEY"
);

if (!GROQ_API_KEY) {
  throw new Error("GROQ_API_KEY is not configured.");
}

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Supabase environment variables are missing.");
}

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type ExamTarget = "GCE" | "NECO";

type GeneratedQuestion = {
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  answer: "A" | "B" | "C" | "D";
  reason: string;
};

const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

function cleanAnswer(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value)
    .trim()
    .toUpperCase()
    .replace(/[^ABCD]/g, "")
    .slice(0, 1);
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

function validateGeneratedQuestion(
  data: any,
  original: any
): GeneratedQuestion {
  const answer = cleanAnswer(data?.answer);
  const originalAnswer = cleanAnswer(original?.answer);

  if (!["A", "B", "C", "D"].includes(answer)) {
    throw new Error(
      `Invalid answer returned by Groq: ${data?.answer}`
    );
  }

  if (answer !== originalAnswer) {
    throw new Error(
      `Groq changed the correct answer from ${originalAnswer} to ${answer}.`
    );
  }

  const options = [
    data?.optionA,
    data?.optionB,
    data?.optionC,
    data?.optionD,
  ];

  if (
    options.some(
      (option) =>
        typeof option !== "string" ||
        option.trim().length === 0
    )
  ) {
    throw new Error("One or more generated options are empty.");
  }

  if (
    typeof data?.question !== "string" ||
    data.question.trim().length === 0
  ) {
    throw new Error("Generated question is empty.");
  }

  if (
    typeof data?.reason !== "string" ||
    data.reason.trim().length === 0
  ) {
    throw new Error("Generated reason is empty.");
  }

  return {
    question: data.question.trim(),
    optionA: data.optionA.trim(),
    optionB: data.optionB.trim(),
    optionC: data.optionC.trim(),
    optionD: data.optionD.trim(),
    answer: answer as "A" | "B" | "C" | "D",
    reason: data.reason.trim(),
  };
}

function buildPrompt(
  original: any,
  targetExam: ExamTarget
): string {
  return `
Create a ${targetExam} version of the following Nigerian secondary-school multiple-choice question.

Genuinely rephrase it using a different sentence structure while preserving:
- the same subject and topic
- the same academic meaning
- the same difficulty
- the same correct answer
- all important numbers, formulas, units and scientific symbols

Use exactly four options.

Do not mention WAEC.
Do not say "rephrased question".
Keep the answer as the same option letter.
Return ONLY valid JSON.

SUBJECT:
${original.subject}

QUESTION:
${original.question}

OPTION A:
${original.optionA}

OPTION B:
${original.optionB}

OPTION C:
${original.optionC}

OPTION D:
${original.optionD}

CORRECT ANSWER:
${original.answer}

REASON:
${original.reason}

Return exactly:
{
  "question": "new question",
  "optionA": "new option A",
  "optionB": "new option B",
  "optionC": "new option C",
  "optionD": "new option D",
  "answer": "${original.answer}",
  "reason": "new explanation"
}
`;
}

async function callGroq(
  prompt: string,
  original: any
): Promise<GeneratedQuestion> {
  const MAX_RETRIES = 5;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "openai/gpt-oss-20b",
          temperature: 0.5,
          max_tokens: 500,
          response_format: {
            type: "json_object",
          },
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
        }),
      }
    );

    if (response.ok) {
      const result = await response.json();

      const outputText =
        result?.choices?.[0]?.message?.content;

      if (!outputText) {
        throw new Error("Groq returned an empty response.");
      }

      let parsed: any;

      try {
        parsed = JSON.parse(outputText);
      } catch {
        throw new Error(
          `Could not parse Groq response: ${outputText}`
        );
      }

      return validateGeneratedQuestion(
        parsed,
        original
      );
    }

    const errorText = await response.text();

    let errorData: any = null;

    try {
      errorData = JSON.parse(errorText);
    } catch {
      errorData = null;
    }

    const isRateLimit =
      response.status === 429 ||
      errorData?.error?.code === "rate_limit_exceeded";

    if (!isRateLimit || attempt === MAX_RETRIES) {
      throw new Error(
        `Groq API error (${response.status}): ${errorText}`
      );
    }

    /*
     * Groq may return a Retry-After header.
     * If it doesn't, use an increasing delay.
     */
    const retryAfterHeader =
      response.headers.get("retry-after");

    let waitMs = retryAfterHeader
      ? Number(retryAfterHeader) * 1000
      : 3000 * (attempt + 1);

    if (!Number.isFinite(waitMs) || waitMs <= 0) {
      waitMs = 3000 * (attempt + 1);
    }

    // Add a small safety buffer.
    waitMs += 1000;

    console.log(
      `Groq rate limit reached. Retry ${
        attempt + 1
      }/${MAX_RETRIES} in ${waitMs}ms.`
    );

    await sleep(waitMs);
  }

  throw new Error("Groq request failed after retries.");
}

async function generateRephrasedQuestion(
  original: any,
  targetExam: ExamTarget
): Promise<GeneratedQuestion> {
  const prompt = buildPrompt(
    original,
    targetExam
  );

  return await callGroq(prompt, original);
}

async function alreadyGenerated(
  sourceId: string,
  targetExam: ExamTarget
): Promise<boolean> {
  const { data, error } = await supabase
    .from("cbt_questions")
    .select("id")
    .eq("source_question_id", sourceId)
    .eq("generated_for", targetExam)
    .limit(1);

  if (error) {
    throw error;
  }

  return Boolean(data && data.length > 0);
}

async function getWaecQuestions(limit: number) {
  const { data, error } = await supabase
    .from("cbt_questions")
    .select(`
      id,
      exam,
      subject,
      question,
      optionA,
      optionB,
      optionC,
      optionD,
      answer,
      reason
    `)
    .eq("exam", "WAEC")
    .order("id", {
      ascending: true,
    })
    .limit(limit);

  if (error) {
    throw error;
  }

  return data || [];
}

async function processQuestion(
  original: any,
  targetExam: ExamTarget
) {
  const exists = await alreadyGenerated(
    original.id,
    targetExam
  );

  if (exists) {
    return {
      status: "skipped",
      sourceId: original.id,
      exam: targetExam,
    };
  }

  const generated =
    await generateRephrasedQuestion(
      original,
      targetExam
    );

  const { data, error } = await supabase
    .from("cbt_questions")
    .insert({
      exam: targetExam,
      subject: original.subject,
      question: generated.question,

      optionA: generated.optionA,
      optionB: generated.optionB,
      optionC: generated.optionC,
      optionD: generated.optionD,

      // Required by your database.
      options: {
        A: generated.optionA,
        B: generated.optionB,
        C: generated.optionC,
        D: generated.optionD,
      },

      answer: generated.answer,
      reason: generated.reason,

      source_question_id: original.id,
      generated_for: targetExam,
      is_rephrased: true,
    })
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  return {
    status: "created",
    sourceId: original.id,
    newId: data.id,
    exam: targetExam,
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({
        success: false,
        error: "Only POST requests are allowed.",
      }),
      {
        status: 405,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }

  try {
    const body = await req.json().catch(
      () => ({})
    );

    /*
     * Keep batches small because Groq has a
     * tokens-per-minute limit.
     */
    const limit = Math.min(
      Math.max(Number(body.limit) || 1, 1),
      20
    );

    const target =
      body.target === "GCE" ||
      body.target === "NECO"
        ? body.target
        : "both";

    const questions =
      await getWaecQuestions(limit);

    if (questions.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "No WAEC questions found.",
          sourceQuestions: 0,
          created: 0,
          skipped: 0,
          errors: 0,
          results: [],
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const results: any[] = [];

    for (const question of questions) {
      if (
        target === "both" ||
        target === "GCE"
      ) {
        try {
          const result =
            await processQuestion(
              question,
              "GCE"
            );

          results.push(result);

          /*
           * Small pause between successful
           * requests to reduce TPM pressure.
           */
          await sleep(1500);
        } catch (error) {
          results.push({
            status: "error",
            sourceId: question.id,
            exam: "GCE",
            error: getErrorMessage(error),
          });

          /*
           * Give Groq a little breathing room
           * after an error.
           */
          await sleep(3000);
        }
      }

      if (
        target === "both" ||
        target === "NECO"
      ) {
        try {
          const result =
            await processQuestion(
              question,
              "NECO"
            );

          results.push(result);

          await sleep(1500);
        } catch (error) {
          results.push({
            status: "error",
            sourceId: question.id,
            exam: "NECO",
            error: getErrorMessage(error),
          });

          await sleep(3000);
        }
      }
    }

    const created = results.filter(
      (item) =>
        item.status === "created"
    ).length;

    const skipped = results.filter(
      (item) =>
        item.status === "skipped"
    ).length;

    const errors = results.filter(
      (item) =>
        item.status === "error"
    ).length;

    return new Response(
      JSON.stringify({
        success: true,
        sourceQuestions:
          questions.length,
        created,
        skipped,
        errors,
        results,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type":
            "application/json",
        },
      }
    );
  } catch (error) {
    console.error(error);

    return new Response(
      JSON.stringify({
        success: false,
        error: getErrorMessage(error),
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type":
            "application/json",
        },
      }
    );
  }
});
